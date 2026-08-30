const Complaint = require('../models/Complaint');

// @desc    Generate AI daily briefing summary for officers
// @route   POST /api/ai/officer-summary
// @access  Private (Officer only)
const getOfficerBriefing = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch aggregate statistics
    const totalComplaints = await Complaint.countDocuments();
    const newToday = await Complaint.countDocuments({ createdAt: { $gte: startOfToday } });
    const overdueComplaints = await Complaint.countDocuments({
      status: { $in: ['Pending', 'In Progress'] },
      createdAt: { $lt: threeDaysAgo }
    });
    const resolvedThisWeek = await Complaint.countDocuments({
      status: 'Resolved',
      updatedAt: { $gte: sevenDaysAgo }
    });

    // Top categories breakdown
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    // Top hotspot areas breakdown
    const areaStats = await Complaint.aggregate([
      { $group: { _id: '$area', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    const statsPayload = {
      totalComplaints,
      newToday,
      overdueComplaints,
      resolvedThisWeek,
      topCategories: categoryStats.map((c) => `${c._id} (${c.count})`),
      hotspotAreas: areaStats.map((a) => `${a._id} (${a.count})`)
    };

    // Call external LLM API if API key configured, otherwise provide intelligent fallback summary
    const apiKey = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY;
    let summaryText = '';

    if (apiKey && process.env.GEMINI_API_KEY) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `System: You are a concise government operations assistant. Summarize these complaint stats in 3-5 plain English sentences for an officer.\nStats: ${JSON.stringify(statsPayload)}`
                    }
                  ]
                }
              ]
            })
          }
        );

        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          summaryText = data.candidates[0].content.parts[0].text;
        }
      } catch (err) {
        console.error('LLM API Call Error:', err.message);
      }
    }

    // High-quality fallback summary if LLM call is omitted or API key absent
    if (!summaryText) {
      summaryText = `Today's Operations Summary: A total of ${totalComplaints} complaints are registered, with ${newToday} submitted today. Currently, ${overdueComplaints} pending/in-progress issues are overdue (older than 3 days) and require urgent action. ${resolvedThisWeek} complaints were successfully resolved this past week. Primary areas requiring focus are ${statsPayload.hotspotAreas.join(', ') || 'N/A'} across ${statsPayload.topCategories.join(', ') || 'N/A'} categories.`;
    }

    return res.status(200).json({
      summary: summaryText,
      stats: statsPayload
    });
  } catch (error) {
    console.error('AI Briefing Error:', error.message);
    return res.status(500).json({ message: 'Server error generating AI briefing', error: error.message });
  }
};

module.exports = {
  getOfficerBriefing
};
