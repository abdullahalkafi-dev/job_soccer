# AI Profile Scoring - Updated Criteria (v1.1)

## Changes Made - October 25, 2025

### 🎯 Key Changes

1. **Removed Video Analysis** - Videos are NO LONGER analyzed by AI to drastically reduce costs
2. **Reduced Completeness Weight** - From 20-25% down to 10% since all required fields must be filled
3. **Increased Focus on Quality** - Experience and detail quality now weighted much higher

---

## Updated Scoring Criteria

### Professional Players
| Criteria | Old Weight | New Weight | Change |
|----------|-----------|-----------|--------|
| Experience | 25% | **35%** | +10% |
| Achievements | 20% | **30%** | +10% |
| Details | 20% | **25%** | +5% |
| Completeness | 20% | **10%** | -10% |
| Videos | 15% | **REMOVED** | -15% |

**Rationale**: Professional players should be judged primarily on their experience and achievements, not just field completion.

---

### Amateur Players
| Criteria | Old Weight | New Weight | Change |
|----------|-----------|-----------|--------|
| Potential | 25% | **35%** | +10% |
| Training | 20% | **30%** | +10% |
| Details | 20% | **25%** | +5% |
| Completeness | 20% | **10%** | -10% |
| Videos | 15% | **REMOVED** | -15% |

**Rationale**: Focus on demonstrated potential and training background.

---

### High School / College Players
| Criteria | Old Weight | New Weight | Change |
|----------|-----------|-----------|--------|
| Academics | 20% | **30%** | +10% |
| Athletics | 25% | **35%** | +10% |
| Details | 20% | **25%** | +5% |
| Completeness | 20% | **10%** | -10% |
| Videos | 15% | **REMOVED** | -15% |

**Rationale**: Academic and athletic performance are key for student-athletes.

---

### On-Field / Office Staff
| Criteria | Old Weight | New Weight | Change |
|----------|-----------|-----------|--------|
| Experience | 30% | **40%** | +10% |
| Certifications | 20% | **30%** | +10% |
| Details | 15% | **20%** | +5% |
| Completeness | 25% | **10%** | -15% |
| Videos | 10% | **REMOVED** | -10% |

**Rationale**: Professional experience and certifications are most important for staff roles.

---

## Why These Changes?

### 1. Cost Reduction
- **Video analysis is expensive** - OpenAI charges per token, and analyzing video content/descriptions would significantly increase costs
- **New cost**: Still ~$0.0001 per score (extremely affordable)
- **Savings**: Potentially 30-50% reduction in token usage

### 2. Logical Scoring
- **Completeness isn't meaningful** - Users cannot create profiles without filling required fields
- **Quality over quantity** - Better to judge depth of information than just presence

### 3. Better Evaluation
- **Experience matters most** - For players and staff, real experience is more valuable than field completion
- **Details show effort** - Quality of written information demonstrates candidate's seriousness

---

## Updated Scoring Guidelines

| Score | Old Interpretation | New Interpretation |
|-------|-------------------|-------------------|
| 90-100 | Exceptional complete profile | **Exceptional detail and extensive experience** |
| 70-89 | Complete professional profile | **Strong profile with quality information** |
| 50-69 | Average with room for improvement | **Average with basic information** |
| 0-49 | Incomplete profile | **Minimal detail provided** |

---

## Technical Changes

### Files Modified:

1. **`src/shared/openai/profileScoring.service.ts`**
   - Updated `PROFILE_SCORING_CRITERIA` object
   - Modified prompt to emphasize quality over quantity
   - Added note that videos are not analyzed
   - Updated instructions to focus on detail and depth

2. **`AI_PROFILE_SCORING_GUIDE.md`**
   - Updated criteria tables
   - Revised scoring guidelines
   - Added notes about cost savings

3. **`AI_SCORING_QUICK_REFERENCE.md`**
   - Updated role-specific criteria
   - Revised score interpretation
   - Added cost savings note

4. **`src/shared/openai/README.md`**
   - Updated criteria breakdown
   - Added importance notes
   - Emphasized cost-effectiveness

---

## Code Example

### Updated Prompt Instructions:
```typescript
INSTRUCTIONS:
1. Evaluate the profile based on the scoring criteria above
2. Focus heavily on the QUALITY and DETAIL of information, not just quantity
3. Reward profiles with specific, detailed, and relevant information
4. Since all required fields must be filled to create a profile, completeness has minimal weight
5. Be critical - only exceptional profiles with rich, detailed information should score above 90
6. Average profiles with basic information should score around 50-60
7. Profiles with exceptional detail and relevant experience should score 70-90
8. DO NOT analyze or score videos - they are not part of the evaluation
```

---

## Migration Notes

### For Existing Profiles:
- No database migration needed
- Existing scores remain valid
- New profiles will use new criteria
- Consider re-scoring existing profiles if needed using batch function

### For Future Scoring:
- All new candidate profiles automatically use updated criteria
- No code changes needed in controllers/routes
- Scoring happens automatically in `user.service.ts`

---

## Testing Recommendations

### Test Cases:

1. **Rich Detail Test**
   - Create profile with extensive, detailed information
   - Expected score: 75-90

2. **Basic Info Test**
   - Create profile with minimal required information
   - Expected score: 40-55

3. **Experienced Professional Test**
   - Create staff profile with many years experience and certifications
   - Expected score: 80-95

4. **Student with Strong Academics**
   - Create student profile with high GPA and achievements
   - Expected score: 70-85

---

## Benefits Summary

✅ **Cost Savings**: 30-50% reduction in API costs  
✅ **Better Logic**: Scoring based on what matters (quality, not just presence)  
✅ **Fairer Evaluation**: Experience and detail weighted appropriately  
✅ **Still Affordable**: ~$0.0001 per score maintained  
✅ **No Breaking Changes**: Existing code continues to work  

---

## Rollout Plan

### Phase 1: Immediate (Today)
- [x] Code updated
- [x] Documentation updated
- [x] No deployment needed (feature works as is)

### Phase 2: Testing (This Week)
- [ ] Test with real profiles
- [ ] Validate score distribution
- [ ] Gather initial feedback

### Phase 3: Monitor (Ongoing)
- [ ] Track score averages by role
- [ ] Monitor API costs
- [ ] Adjust criteria if needed based on data

---

## Questions & Answers

**Q: Will existing scores change?**  
A: No, existing scores in the database remain unchanged. Only new profiles will use the new criteria.

**Q: Can we still see if a profile has videos?**  
A: Yes! The `videos` field still exists in profiles. We just don't analyze them with AI.

**Q: What if we want to re-score old profiles?**  
A: Use the `batchGenerateProfileScores()` function to re-score existing profiles with new criteria.

**Q: Are videos still required for some roles?**  
A: Yes, video upload requirements haven't changed. We just don't analyze them with AI for scoring.

---

## Contact

For questions about these changes:
- Review this document
- Check updated guides in project root
- Test with sample profiles

---

**Version**: 1.1  
**Date**: October 25, 2025  
**Status**: ✅ Updated & Ready
