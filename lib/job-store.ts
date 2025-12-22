// lib/job-store.ts

/**
 * Simple in-memory job store for video generation status
 * 
 * PRODUCTION NOTE: Replace this with Redis or a database
 * for production use to handle multiple server instances
 * and persist data across restarts.
 */

interface Job {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  videoUrl?: string | null;
  error?: string | null;
  data?: any;
  completedAt?: string;
  createdAt?: string;
}

class JobStore {
  private store: Map<string, Job>;
  private maxAge: number = 1000 * 60 * 60 * 24; // 24 hours

  constructor() {
    this.store = new Map();
    
    // Clean up old jobs every hour (only on server)
    if (typeof window === 'undefined') {
      setInterval(() => this.cleanup(), 1000 * 60 * 60);
    }
  }

  set(jobId: string, job: Partial<Job>): Job {
    const existingJob = this.store.get(jobId);
    const updatedJob: Job = {
      jobId,
      status: 'processing',
      createdAt: new Date().toISOString(),
      ...existingJob,
      ...job,
    };
    
    this.store.set(jobId, updatedJob);
    console.log(`📦 Job ${jobId} stored:`, updatedJob.status);
    return updatedJob;
  }

  get(jobId: string): Job | undefined {
    return this.store.get(jobId);
  }

  delete(jobId: string): boolean {
    const deleted = this.store.delete(jobId);
    if (deleted) {
      console.log(`🗑️ Job ${jobId} deleted`);
    }
    return deleted;
  }

  has(jobId: string): boolean {
    return this.store.has(jobId);
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [jobId, job] of this.store.entries()) {
      const createdAt = new Date(job.createdAt || job.completedAt || '').getTime();
      if (now - createdAt > this.maxAge) {
        this.store.delete(jobId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} old jobs from store`);
    }
  }

  // Get all jobs (for debugging)
  getAll(): Job[] {
    return Array.from(this.store.values());
  }

  // Get store size
  size(): number {
    return this.store.size;
  }

  // Clear all jobs (for testing)
  clear(): void {
    this.store.clear();
    console.log('🧹 Job store cleared');
  }
}

// Export a singleton instance
export const jobStore = new JobStore();

// For debugging in development
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  // @ts-ignore - Make it available in Node.js console
  global.jobStore = jobStore;
  console.log('💡 Job store is available in console as: global.jobStore');
}