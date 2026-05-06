const getProtectedData = (req, res) => {
  try {
    // req.user.id is populated by our attachUser middleware
    const userId = req.user.id;
    
    res.status(200).json({
      success: true,
      message: 'You have accessed a protected route successfully!',
      data: {
        userId: userId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = { getProtectedData };
