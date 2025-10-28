# Job Query Optimization Guide

This guide explains how the job schema is optimized for high-performance queries and searches.

## 🚀 Key Optimizations

### 1. **Strategic Single-Field Indexes**
```javascript
// Most frequently filtered fields
- jobCategory (index)     → Filter by candidate role
- status (index)          → Filter active/closed jobs
- location (index)        → Location-based search
- deadline (index)        → Sort/filter by deadline
- creator.creatorId (index) → Find jobs by employer
- creator.creatorRole (index) → Filter by employer type
- salary.min/max (index)  → Salary range queries
```

### 2. **Compound Indexes for Common Query Patterns**

#### Pattern 1: Browse active jobs by category in a location
```javascript
// Index: { status: 1, jobCategory: 1, location: 1 }
JobModel.find({
  status: "active",
  jobCategory: "Professional Player",
  location: "Barcelona"
});
```

#### Pattern 2: Salary-based filtering
```javascript
// Index: { status: 1, jobCategory: 1, "salary.min": 1, "salary.max": 1 }
JobModel.find({
  status: "active",
  jobCategory: "Amateur Player",
  "salary.min": { $lte: 50000 },
  "salary.max": { $gte: 30000 }
});
```

#### Pattern 3: Employer's job dashboard
```javascript
// Index: { "creator.creatorId": 1, status: 1, createdAt: -1 }
JobModel.find({
  "creator.creatorId": employerId,
  status: "active"
}).sort({ createdAt: -1 });
```

#### Pattern 4: Jobs expiring soon
```javascript
// Index: { status: 1, deadline: 1 }
JobModel.find({
  status: "active",
  deadline: { $gte: new Date(), $lte: nextWeek }
}).sort({ deadline: 1 });
```

#### Pattern 5: Filter by employer type and target role
```javascript
// Index: { "creator.creatorRole": 1, jobCategory: 1, status: 1 }
JobModel.find({
  "creator.creatorRole": "Professional Club",
  jobCategory: "Professional Player",
  status: "active"
});
```

### 3. **Full-Text Search Index**
```javascript
// Index: { jobTitle: "text", position: "text", jobOverview: "text", location: "text" }

// Usage:
JobModel.find({
  $text: { $search: "striker premier league" }
}).sort({ score: { $meta: "textScore" } });
```

### 4. **Auto-Keyword Generation**
```javascript
// Automatically generated on save for faster keyword matching
searchKeywords: ["striker", "forward", "goal", "scorer"]

// Query:
JobModel.find({
  searchKeywords: { $in: ["striker", "forward"] }
});
```

## 📊 Query Performance Examples

### Example 1: Advanced Job Search
```typescript
const jobs = await JobModel.findActiveJobs({
  jobCategory: "Professional Player",
  location: "Spain",
  contractType: "FullTime",
  minSalary: 50000,
  maxSalary: 200000,
  employerRole: "Professional Club",
  page: 1,
  limit: 20,
  sortBy: "-createdAt"
});
```
**Optimization**: Uses compound index `{ status: 1, jobCategory: 1, location: 1 }`

### Example 2: Text Search
```typescript
const jobs = await JobModel.searchJobs("striker premier league", {
  jobCategory: "Professional Player",
  contractType: "FullTime"
});
```
**Optimization**: Uses text index + additional filters

### Example 3: Employer Dashboard
```typescript
const myJobs = await JobModel.getJobsByEmployer(employerId, "active");
```
**Optimization**: Uses compound index `{ "creator.creatorId": 1, status: 1, createdAt: -1 }`

### Example 4: Trending Jobs
```typescript
const trending = await JobModel.find({
  status: "active"
}).sort({ applicationCount: -1, createdAt: -1 }).limit(10);
```
**Optimization**: Uses compound index `{ status: 1, applicationCount: -1, createdAt: -1 }`

## 🔧 Performance Tips

### 1. **Use Lean Queries**
```typescript
// ✅ Good: Returns plain JavaScript objects (faster)
const jobs = await JobModel.find({ status: "active" }).lean();

// ❌ Bad: Returns Mongoose documents (slower)
const jobs = await JobModel.find({ status: "active" });
```

### 2. **Select Only Needed Fields**
```typescript
// ✅ Good: Reduce data transfer
const jobs = await JobModel.find({ status: "active" })
  .select("jobTitle position location salary deadline")
  .lean();

// ❌ Bad: Fetches all fields
const jobs = await JobModel.find({ status: "active" }).lean();
```

### 3. **Use Populate Wisely**
```typescript
// ✅ Good: Populate with field selection
const jobs = await JobModel.find({ status: "active" })
  .populate("creator.creatorId", "firstName lastName email profileImage")
  .lean();

// ❌ Bad: Populates all employer fields
const jobs = await JobModel.find({ status: "active" })
  .populate("creator.creatorId")
  .lean();
```

### 4. **Batch Updates**
```typescript
// ✅ Good: Update without fetching document
await JobModel.updateOne(
  { _id: jobId },
  { $inc: { viewCount: 1 } }
);

// ❌ Bad: Fetch then update
const job = await JobModel.findById(jobId);
job.viewCount += 1;
await job.save();
```

### 5. **Pagination**
```typescript
// ✅ Good: Use skip and limit
const page = 2;
const limit = 20;
const jobs = await JobModel.find({ status: "active" })
  .skip((page - 1) * limit)
  .limit(limit)
  .lean();

// ❌ Bad: Fetch all then slice
const allJobs = await JobModel.find({ status: "active" });
const jobs = allJobs.slice(20, 40);
```

## 📈 Index Usage Statistics

To check if your queries are using indexes:

```javascript
// In MongoDB shell
db.jobs.find({ status: "active", jobCategory: "Professional Player" }).explain("executionStats")

// Look for:
// - winningPlan.stage: "IXSCAN" (using index) ✅
// - winningPlan.stage: "COLLSCAN" (collection scan) ❌
```

## ⚡ Expected Query Times

With proper indexes:
- Simple filters (status, category): **< 10ms**
- Compound filters (3-4 fields): **< 50ms**
- Text search: **< 100ms**
- Paginated results (20 items): **< 50ms**
- Employer's jobs: **< 20ms**

## 🛠️ Creating Indexes in Production

After deploying the model, ensure indexes are created:

```bash
# Connect to MongoDB
mongosh

# Use your database
use your_database_name

# Check existing indexes
db.jobs.getIndexes()

# Manually create if needed (model should auto-create)
db.jobs.createIndex({ status: 1, jobCategory: 1, location: 1 })
db.jobs.createIndex({ "creator.creatorId": 1, status: 1, createdAt: -1 })
```

## 🔍 Monitoring Query Performance

```typescript
// Add this to development environment
mongoose.set('debug', true); // Log all queries

// Or use mongoose plugin
const queryLogger = function(schema: any) {
  schema.pre('find', function() {
    this._startTime = Date.now();
  });
  
  schema.post('find', function(docs: any) {
    if (this._startTime) {
      console.log(`Query took ${Date.now() - this._startTime}ms`);
    }
  });
};

jobSchema.plugin(queryLogger);
```

## 📝 Best Practices Summary

1. ✅ Always filter by `status: "active"` first
2. ✅ Use compound indexes for multi-field queries
3. ✅ Use `.lean()` for read-only operations
4. ✅ Select only required fields
5. ✅ Use `$inc` for counters (viewCount, applicationCount)
6. ✅ Implement pagination for large result sets
7. ✅ Use text search for keyword queries
8. ✅ Populate with field selection
9. ✅ Monitor slow queries with `explain()`
10. ✅ Use batch operations when possible

---

This structure keeps your **simple job interface** while providing **maximum query performance** for all employer roles! 🚀
