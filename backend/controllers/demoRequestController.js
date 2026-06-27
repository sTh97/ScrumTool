const DemoRequest = require("../models/DemoRequest");

exports.createDemoRequest = async (req, res) => {
  try {
    const { name, email, company, contact, message } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    const demoRequest = await DemoRequest.create({
      name: name.trim(),
      email: email.trim(),
      company: company?.trim() || "",
      contact: contact?.trim() || "",
      message: message?.trim() || "",
    });

    res.status(201).json({ message: "Demo request submitted successfully.", demoRequest });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllDemoRequests = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search?.trim()) {
      const term = search.trim();
      filter.$or = [
        { name: { $regex: term, $options: "i" } },
        { email: { $regex: term, $options: "i" } },
        { company: { $regex: term, $options: "i" } },
      ];
    }

    const demoRequests = await DemoRequest.find(filter).sort({ createdAt: -1 });
    res.json(demoRequests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDemoRequestById = async (req, res) => {
  try {
    const demoRequest = await DemoRequest.findById(req.params.id);
    if (!demoRequest) {
      return res.status(404).json({ message: "Demo request not found." });
    }
    res.json(demoRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateDemoRequest = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updates = {};

    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const demoRequest = await DemoRequest.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!demoRequest) {
      return res.status(404).json({ message: "Demo request not found." });
    }

    res.json(demoRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [total, statusCounts, recentRequests] = await Promise.all([
      DemoRequest.countDocuments(),
      DemoRequest.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      DemoRequest.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email company status createdAt"),
    ]);

    const byStatus = {
      pending: 0,
      reviewed: 0,
      discovery_call_done: 0,
      deal_closed: 0,
      deal_rejected: 0,
    };

    statusCounts.forEach(({ _id, count }) => {
      if (_id in byStatus) byStatus[_id] = count;
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = await DemoRequest.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    res.json({
      total,
      thisMonth,
      byStatus,
      conversionRate:
        total > 0 ? Math.round((byStatus.deal_closed / total) * 100) : 0,
      recentRequests,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
