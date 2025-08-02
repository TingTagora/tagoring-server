const Job = require('./models/Job');
const { initializeDatabase } = require('./config/database');

const seedJobs = async () => {
  try {
    await initializeDatabase();
    
    const jobs = [
      {
        title: 'Content Writer',
        description: 'Create engaging content for blogs, websites, and social media platforms. Research industry trends and write compelling articles that drive engagement.',
        requirements: JSON.stringify(['Content Writing', 'SEO', 'Research', 'WordPress']),
        isActive: true
      },
      {
        title: 'Social Media Manager',
        description: 'Manage social media presence across multiple platforms. Create engaging campaigns, analyze metrics, and build community engagement.',
        requirements: JSON.stringify(['Social Media', 'Content Creation', 'Analytics', 'Canva']),
        isActive: true
      },
      {
        title: 'Web Developer',
        description: 'Build and maintain modern, responsive websites using the latest technologies. Work on both frontend and backend development.',
        requirements: JSON.stringify(['HTML/CSS', 'JavaScript', 'React', 'Node.js']),
        isActive: true
      },
      {
        title: 'Digital Marketing Specialist',
        description: 'Drive online growth through strategic digital marketing campaigns. Manage PPC campaigns, SEO optimization, and marketing analytics.',
        requirements: JSON.stringify(['SEO', 'PPC', 'Google Analytics', 'Marketing Strategy']),
        isActive: true
      },
      {
        title: 'Graphic Designer',
        description: 'Create stunning visual content for various platforms including websites, social media, and marketing materials.',
        requirements: JSON.stringify(['Photoshop', 'Illustrator', 'Canva', 'Brand Design']),
        isActive: true
      },
      {
        title: 'Virtual Assistant',
        description: 'Provide comprehensive administrative support and help streamline business operations. Handle email management, scheduling, and project coordination.',
        requirements: JSON.stringify(['Admin Tasks', 'Communication', 'Organization', 'Time Management']),
        isActive: true
      }
    ];

    console.log('Seeding jobs...');
    
    for (const jobData of jobs) {
      try {
        await Job.create(jobData);
        console.log(`Created job: ${jobData.title}`);
      } catch (error) {
        console.log(`Job ${jobData.title} might already exist:`, error.message);
      }
    }

    console.log('Job seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding jobs:', error);
    process.exit(1);
  }
};

seedJobs();
