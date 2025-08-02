const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const User = require('../models/User');
const Job = require('../models/Job');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Get admin statistics
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const [
      totalApplications,
      totalUsers,
      totalJobs,
      applicationStatusCounts
    ] = await Promise.all([
      Application.count(),
      User.count(),
      Job.count(),
      Application.countByStatus()
    ]);

    // Get recent applications
    const allApplications = await Application.find();
    const recentApplications = allApplications
      .slice(0, 5)
      .map(app => ({
        fullName: app.fullName,
        userEmail: app.userEmail,
        jobTitle: app.jobTitle,
        status: app.status,
        createdAt: app.createdAt
      }));

    // Simple month-based data (you can enhance this later)
    const currentDate = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const applicationsByMonth = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      applicationsByMonth.push({
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        applications: Math.floor(Math.random() * 20) + 5 // Placeholder data
      });
    }

    const stats = {
      overview: {
        totalApplications,
        totalUsers,
        totalJobs,
        pendingApplications: applicationStatusCounts.pending,
        acceptedApplications: applicationStatusCounts.accepted,
        rejectedApplications: applicationStatusCounts.rejected,
        reviewedApplications: applicationStatusCounts.reviewed
      },
      recentApplications,
      applicationsByMonth
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

// Get application analytics
router.get('/analytics/applications', authenticate, requireAdmin, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    
    // For now, return simple analytics. You can enhance this later with more complex date-based queries
    const applications = await Application.find();
    
    // Group by status for simple analytics
    const analytics = applications.reduce((acc, app) => {
      const status = app.status;
      if (!acc[status]) {
        acc[status] = 0;
      }
      acc[status]++;
      return acc;
    }, {});

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

module.exports = router;
