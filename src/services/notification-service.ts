import Notification from '../models/Notification';

class NotificationService {
  async createNotification(notificationData: object) {
    console.log('1');
    const newNotification = new Notification(notificationData);
    const data = await newNotification.save();
    console.log(data);
    return data;
  }
}

export default NotificationService;
