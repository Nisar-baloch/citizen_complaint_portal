const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Complaint = require('./models/Complaint');

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // Clear existing data
    console.log('Clearing database collection data...');
    await User.deleteMany({});
    await Complaint.deleteMany({});

    // Hash demo password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create demo users
    console.log('Seeding demo users...');
    const citizen = await User.create({
      name: 'Sarah Connor',
      email: 'citizen@civic.com',
      password: hashedPassword,
      role: 'citizen'
    });

    const citizen2 = await User.create({
      name: 'Bruce Wayne',
      email: 'citizen2@civic.com',
      password: hashedPassword,
      role: 'citizen'
    });

    const officer = await User.create({
      name: 'Officer Gordon',
      email: 'officer@civic.com',
      password: hashedPassword,
      role: 'officer'
    });

    console.log(`Demo users seeded:
    Citizen: citizen@civic.com / password123
    Officer: officer@civic.com / password123`);

    // Create sample complaints
    console.log('Seeding sample complaints...');
    
    // Complaint 1: Road issue - Pending - Low Upvotes
    const c1 = await Complaint.create({
      title: 'Massive Pothole on Main Avenue',
      description: 'There is a huge pothole right in front of the grocery store that is causing severe traffic bottle-necks and tire damage for vehicles. Needs immediate patching.',
      category: 'Road',
      area: 'sector g-9',
      status: 'Pending',
      upvotes: 3,
      upvotedBy: [citizen._id],
      createdBy: citizen._id
    });

    // Complaint 2: Garbage issue - In Progress - Medium Upvotes
    const c2 = await Complaint.create({
      title: 'Accumulated Plastic & Waste Dump',
      description: 'Household garbage has been piling up near the local kids park for over a week. Strays are scattering it everywhere, causing foul smell and health hazards.',
      category: 'Garbage',
      area: 'sector g-9',
      status: 'In Progress',
      upvotes: 7,
      upvotedBy: [citizen._id, citizen2._id],
      createdBy: citizen2._id,
      officerRemark: 'Sanitation vehicle deployed to investigate. Cleanup scheduled for Wednesday.'
    });

    // Complaint 3: Water issue - Resolved - Feedback Pending
    const c3 = await Complaint.create({
      title: 'Water Pipeline Burst & Flooding',
      description: 'A municipal water mains pipe has cracked underneath the sidewalk. Clean drinking water is leaking and flooding the road, creating a water logging problem.',
      category: 'Water',
      area: 'sector h-8',
      status: 'Resolved',
      upvotes: 1,
      upvotedBy: [citizen._id],
      createdBy: citizen._id,
      officerRemark: 'Water board maintenance team repaired the joints and restored sidewalk paving.',
      feedbackPending: true
    });

    // Complaint 4: Electricity issue - Pending - High Upvotes (Will be Critical priority)
    // 3 days ago date to simulate overdue / high priority
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 4);
    
    const c4 = new Complaint({
      title: 'Entire Sector Streetlights Outage',
      description: 'All streetlights from Lane 1 through 5 are completely dark. This has made the sector highly unsafe at night and we have reported multiple petty crimes this week.',
      category: 'Electricity',
      area: 'sector g-9',
      status: 'Pending',
      upvotes: 16,
      upvotedBy: [citizen._id, citizen2._id],
      createdBy: citizen2._id,
      createdAt: threeDaysAgo
    });
    await c4.save();

    // Complaint 5: Water issue - Resolved - Feedback Given
    const c5 = await Complaint.create({
      title: 'Contaminated Muddy Tap Water supply',
      description: 'Tap water received in Block B has been coming out muddy brown and smelling of iron since Sunday. It is completely undrinkable.',
      category: 'Water',
      area: 'sector i-10',
      status: 'Resolved',
      upvotes: 4,
      upvotedBy: [citizen._id, citizen2._id],
      createdBy: citizen._id,
      officerRemark: 'Flushed mains system reservoir filter. Supply cleared and water purity verified.',
      feedbackGiven: true,
      feedbackRating: 4,
      feedbackComment: 'Water is clean now. Prompt response by the municipal authorities.',
      feedbackPending: false
    });

    console.log('Database seeded successfully with sample complaints!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
