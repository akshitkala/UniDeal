// Import all models here to ensure they are registered with Mongoose
// before any populate() calls run anywhere in the app.
import '@/models/User';
import '@/models/Listing';
import '@/models/Category';
import '@/models/AdminActivity';
import '@/models/SystemConfig';
import '@/models/Report';
