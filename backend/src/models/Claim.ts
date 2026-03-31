import { ClaimRow, ClaimStatus } from '../types/domain';

export class Claim {
  readonly id: number;
  itemId: number;
  claimerId: number;
  message: string;
  claimStatus: ClaimStatus;
  createdAt: string;
  updatedAt: string;

  constructor(row: ClaimRow) {
    this.id = row.id;
    this.itemId = row.item_id;
    this.claimerId = row.claimer_id;
    this.message = row.message;
    this.claimStatus = row.claim_status;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  isPending(): boolean { return this.claimStatus === 'pending'; }
  isAccepted(): boolean { return this.claimStatus === 'accepted'; }
  isRejected(): boolean { return this.claimStatus === 'rejected'; }
}
