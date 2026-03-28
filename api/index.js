const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Allow requests from the deployed frontend (set FRONTEND_URL in Vercel env vars)
// Falls back to allowing all origins if not set
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

app.use(express.json());

// ─── In-Memory Database ───────────────────────────────────────────────────────
let users = [];
let companies = [];       // company profiles
let opportunities = [];   // attachment opportunities posted by companies
let applications = [];    // student applications
let placements = [];      // confirmed placements
let tokens = {};          // token -> userId map

// ─── Bootstrap Admin ──────────────────────────────────────────────────────────
// Only the default admin account is created on startup. All other data
// (students, companies, opportunities, applications, placements) starts empty
// and is populated through the application UI.
users.push({
  id: uuidv4(),
  name: 'System Admin',
  email: 'admin@sapms.ac',
  password: 'admin123',
  role: 'admin',
  createdAt: new Date().toISOString(),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateToken = (userId) => {
  const token = uuidv4();
  tokens[token] = userId;
  return token;
};

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.replace('Bearer ', '');
  const userId = tokens[token];
  if (!userId) return res.status(401).json({ error: 'Invalid token' });
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(401).json({ error: 'User not found' });
  req.user = user;
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Access denied' });
  next();
};

const safeUser = (u) => {
  const { password, ...rest } = u;
  return rest;
};

// ─── AUTH Routes ─────────────────────────────────────────────────────────────
app.post('/auth/register', (req, res) => {
  const { name, email, password, role, course, year, university, industry, location, description } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ error: 'Missing required fields' });
  if (!['student', 'company'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already registered' });

  const userId = uuidv4();
  const newUser = { id: userId, name, email, password, role, createdAt: new Date().toISOString() };

  if (role === 'student') {
    Object.assign(newUser, { course: course || '', year: year || 1, university: university || '' });
  } else if (role === 'company') {
    const companyId = uuidv4();
    newUser.companyId = companyId;
    companies.push({ id: companyId, userId, name, industry: industry || '', location: location || '', description: description || '', createdAt: new Date().toISOString() });
  }

  users.push(newUser);
  const token = generateToken(userId);
  res.status(201).json({ token, user: safeUser(newUser) });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = generateToken(user.id);
  res.json({ token, user: safeUser(user) });
});

app.get('/auth/me', authenticate, (req, res) => {
  res.json({ user: safeUser(req.user) });
});

// ─── STUDENTS Routes ──────────────────────────────────────────────────────────
app.get('/students', authenticate, requireRole('admin'), (req, res) => {
  const students = users.filter(u => u.role === 'student').map(safeUser);
  const enriched = students.map(s => {
    const studentApps = applications.filter(a => a.studentId === s.id);
    const placement = placements.find(p => p.studentId === s.id);
    return { ...s, applicationCount: studentApps.length, placement: placement || null };
  });
  res.json(enriched);
});

app.get('/students/:id', authenticate, (req, res) => {
  const student = users.find(u => u.id === req.params.id && u.role === 'student');
  if (!student) return res.status(404).json({ error: 'Student not found' });
  if (req.user.role === 'student' && req.user.id !== req.params.id) return res.status(403).json({ error: 'Access denied' });
  res.json(safeUser(student));
});

// ─── COMPANIES Routes ─────────────────────────────────────────────────────────
app.get('/companies', authenticate, (req, res) => {
  const enriched = companies.map(c => {
    const opps = opportunities.filter(o => o.companyId === c.id);
    return { ...c, opportunityCount: opps.length };
  });
  res.json(enriched);
});

app.get('/companies/:id', authenticate, (req, res) => {
  const company = companies.find(c => c.id === req.params.id);
  if (!company) return res.status(404).json({ error: 'Company not found' });
  const opps = opportunities.filter(o => o.companyId === company.id);
  res.json({ ...company, opportunities: opps });
});

app.put('/companies/:id', authenticate, requireRole('company'), (req, res) => {
  const company = companies.find(c => c.id === req.params.id);
  if (!company) return res.status(404).json({ error: 'Company not found' });
  if (company.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });
  const { name, industry, location, description } = req.body;
  if (name) company.name = name;
  if (industry) company.industry = industry;
  if (location) company.location = location;
  if (description) company.description = description;
  res.json(company);
});

// ─── OPPORTUNITIES Routes ─────────────────────────────────────────────────────
app.get('/opportunities', authenticate, (req, res) => {
  const enriched = opportunities.map(o => {
    const company = companies.find(c => c.id === o.companyId);
    const appCount = applications.filter(a => a.opportunityId === o.id).length;
    return { ...o, company: company || null, applicationCount: appCount };
  });
  res.json(enriched);
});

app.get('/opportunities/:id', authenticate, (req, res) => {
  const opp = opportunities.find(o => o.id === req.params.id);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
  const company = companies.find(c => c.id === opp.companyId);
  const appCount = applications.filter(a => a.opportunityId === opp.id).length;
  res.json({ ...opp, company, applicationCount: appCount });
});

app.post('/opportunities', authenticate, requireRole('company'), (req, res) => {
  const { title, description, slots, duration, requirements } = req.body;
  if (!title || !description || !slots) return res.status(400).json({ error: 'Missing required fields' });
  const company = companies.find(c => c.userId === req.user.id);
  if (!company) return res.status(404).json({ error: 'Company profile not found' });
  const opp = { id: uuidv4(), companyId: company.id, title, description, slots: parseInt(slots), duration: duration || '3 months', requirements: requirements || '', status: 'active', createdAt: new Date().toISOString() };
  opportunities.push(opp);
  res.status(201).json(opp);
});

app.put('/opportunities/:id', authenticate, requireRole('company'), (req, res) => {
  const opp = opportunities.find(o => o.id === req.params.id);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
  const company = companies.find(c => c.id === opp.companyId && c.userId === req.user.id);
  if (!company) return res.status(403).json({ error: 'Access denied' });
  const { title, description, slots, duration, requirements, status } = req.body;
  if (title) opp.title = title;
  if (description) opp.description = description;
  if (slots) opp.slots = parseInt(slots);
  if (duration) opp.duration = duration;
  if (requirements) opp.requirements = requirements;
  if (status) opp.status = status;
  res.json(opp);
});

app.delete('/opportunities/:id', authenticate, requireRole('company'), (req, res) => {
  const idx = opportunities.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Opportunity not found' });
  const company = companies.find(c => c.id === opportunities[idx].companyId && c.userId === req.user.id);
  if (!company) return res.status(403).json({ error: 'Access denied' });
  opportunities.splice(idx, 1);
  res.json({ message: 'Deleted' });
});

// ─── APPLICATIONS Routes ──────────────────────────────────────────────────────
app.get('/applications', authenticate, (req, res) => {
  let apps = applications;

  if (req.user.role === 'student') {
    apps = apps.filter(a => a.studentId === req.user.id);
  } else if (req.user.role === 'company') {
    const company = companies.find(c => c.userId === req.user.id);
    if (!company) return res.json([]);
    const companyOppIds = opportunities.filter(o => o.companyId === company.id).map(o => o.id);
    apps = apps.filter(a => companyOppIds.includes(a.opportunityId));
  }

  const enriched = apps.map(a => {
    const student = users.find(u => u.id === a.studentId);
    const opp = opportunities.find(o => o.id === a.opportunityId);
    const company = opp ? companies.find(c => c.id === opp.companyId) : null;
    return { ...a, student: student ? safeUser(student) : null, opportunity: opp || null, company: company || null };
  });
  res.json(enriched);
});

app.post('/applications', authenticate, requireRole('student'), (req, res) => {
  const { opportunityId, coverLetter } = req.body;
  if (!opportunityId) return res.status(400).json({ error: 'opportunityId required' });
  const opp = opportunities.find(o => o.id === opportunityId && o.status === 'active');
  if (!opp) return res.status(404).json({ error: 'Opportunity not found or inactive' });

  const existing = applications.find(a => a.studentId === req.user.id && a.opportunityId === opportunityId);
  if (existing) return res.status(400).json({ error: 'Already applied to this opportunity' });

  const acceptedCount = applications.filter(a => a.opportunityId === opportunityId && a.status === 'accepted').length;
  if (acceptedCount >= opp.slots) return res.status(400).json({ error: 'No slots available' });

  const app = { id: uuidv4(), studentId: req.user.id, opportunityId, coverLetter: coverLetter || '', status: 'pending', appliedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  applications.push(app);
  res.status(201).json(app);
});

app.put('/applications/:id/status', authenticate, requireRole('company', 'admin'), (req, res) => {
  const application = applications.find(a => a.id === req.params.id);
  if (!application) return res.status(404).json({ error: 'Application not found' });

  if (req.user.role === 'company') {
    const opp = opportunities.find(o => o.id === application.opportunityId);
    const company = companies.find(c => c.id === opp?.companyId && c.userId === req.user.id);
    if (!company) return res.status(403).json({ error: 'Access denied' });
  }

  const { status } = req.body;
  if (!['pending', 'accepted', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

  if (status === 'accepted') {
    const opp = opportunities.find(o => o.id === application.opportunityId);
    const acceptedCount = applications.filter(a => a.opportunityId === application.opportunityId && a.status === 'accepted' && a.id !== application.id).length;
    if (acceptedCount >= opp.slots) return res.status(400).json({ error: 'No slots remaining' });
  }

  application.status = status;
  application.updatedAt = new Date().toISOString();
  res.json(application);
});

// ─── PLACEMENTS Routes ────────────────────────────────────────────────────────
app.get('/placements', authenticate, (req, res) => {
  let pls = placements;
  if (req.user.role === 'student') {
    pls = pls.filter(p => p.studentId === req.user.id);
  } else if (req.user.role === 'company') {
    const company = companies.find(c => c.userId === req.user.id);
    pls = pls.filter(p => p.companyId === company?.id);
  }

  const enriched = pls.map(p => {
    const student = users.find(u => u.id === p.studentId);
    const company = companies.find(c => c.id === p.companyId);
    const opp = opportunities.find(o => o.id === p.opportunityId);
    return { ...p, student: student ? safeUser(student) : null, company: company || null, opportunity: opp || null };
  });
  res.json(enriched);
});

app.post('/placements', authenticate, requireRole('admin'), (req, res) => {
  const { studentId, companyId, opportunityId, startDate, endDate, notes } = req.body;
  if (!studentId || !companyId || !opportunityId) return res.status(400).json({ error: 'Missing required fields' });

  const student = users.find(u => u.id === studentId && u.role === 'student');
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const existing = placements.find(p => p.studentId === studentId);
  if (existing) return res.status(400).json({ error: 'Student already has a placement' });

  const application = applications.find(a => a.studentId === studentId && a.opportunityId === opportunityId);
  if (application) { application.status = 'accepted'; application.updatedAt = new Date().toISOString(); }

  const placement = { id: uuidv4(), studentId, companyId, opportunityId, startDate: startDate || '', endDate: endDate || '', notes: notes || '', status: 'confirmed', confirmedAt: new Date().toISOString(), confirmedBy: req.user.id };
  placements.push(placement);
  res.status(201).json(placement);
});

app.put('/placements/:id', authenticate, requireRole('admin'), (req, res) => {
  const placement = placements.find(p => p.id === req.params.id);
  if (!placement) return res.status(404).json({ error: 'Placement not found' });
  const { status, startDate, endDate, notes } = req.body;
  if (status) placement.status = status;
  if (startDate) placement.startDate = startDate;
  if (endDate) placement.endDate = endDate;
  if (notes !== undefined) placement.notes = notes;
  res.json(placement);
});

app.delete('/placements/:id', authenticate, requireRole('admin'), (req, res) => {
  const idx = placements.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Placement not found' });
  placements.splice(idx, 1);
  res.json({ message: 'Placement removed' });
});

// ─── STATS Route ──────────────────────────────────────────────────────────────
app.get('/stats', authenticate, requireRole('admin'), (req, res) => {
  res.json({
    totalStudents: users.filter(u => u.role === 'student').length,
    totalCompanies: companies.length,
    totalOpportunities: opportunities.length,
    totalApplications: applications.length,
    pendingApplications: applications.filter(a => a.status === 'pending').length,
    acceptedApplications: applications.filter(a => a.status === 'accepted').length,
    rejectedApplications: applications.filter(a => a.status === 'rejected').length,
    totalPlacements: placements.length,
    confirmedPlacements: placements.filter(p => p.status === 'confirmed').length,
  });
});

// Export for Vercel serverless — do NOT call app.listen() in production.
// Vercel invokes the exported handler directly.
module.exports = app;

// Allow local development: only listen when run directly with `node api/index.js`
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`SAPMS Server running on port ${PORT}`));
}
