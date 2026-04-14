import bus from '../patterns/EventBus';
import notificationRepository from '../repositories/NotificationRepository';
import { NotificationRow } from '../types/domain';

/**
 * NotificationService — subscribes to domain events and persists user-facing
 * notifications. Demonstrates the Observer pattern: other services just
 * publish an event; this one decides what to do about it.
 */
export class NotificationService {
  constructor(private readonly repo = notificationRepository) {
    this.registerHandlers();
  }

  private registerHandlers(): void {
    bus.subscribe('claim.submitted', ({ ownerId, itemTitle, claimerName }) => {
      this.repo.create(ownerId, `New claim on "${itemTitle}" from ${claimerName}.`).catch((err) => {
        console.error('Failed to persist notification:', err);
      });
    });

    bus.subscribe('claim.accepted', ({ claimerId, itemTitle }) => {
      this.repo.create(claimerId, `Your claim on "${itemTitle}" was accepted.`).catch(console.error);
    });

    bus.subscribe('claim.rejected', ({ claimerId, itemTitle }) => {
      this.repo.create(claimerId, `Your claim on "${itemTitle}" was rejected.`).catch(console.error);
    });

    bus.subscribe('reward.completed', ({ claimerId, itemTitle, amount }) => {
      this.repo.create(claimerId, `Reward of ₹${amount} marked completed for "${itemTitle}".`).catch(console.error);
    });

    bus.subscribe('user.suspended', ({ userId }) => {
      this.repo.create(userId, `Your account has been suspended by an administrator.`).catch(console.error);
    });
  }

  async listForUser(userId: string): Promise<NotificationRow[]> { return this.repo.findByUser(userId); }
  async markRead(id: string, userId: string): Promise<void> { return this.repo.markRead(id, userId); }
}

export default new NotificationService();
