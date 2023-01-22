import { billing, payment } from "@prisma/client";
import { BillingStatus } from "src/app/enum/status.enum";
import { DatabaseService } from "src/database/database.service";

export class BillingRepository {

  private readonly connection: DatabaseService;

  constructor(databaseService: DatabaseService) {
      this.connection = databaseService;
  }

  public async findBillingById(billingId: string): Promise<billing | null> {
    return await this.connection.billing.findFirst({
      where: {
        id: billingId, 
      },
    });
  }

  public async findExpiredBillings(): Promise<billing[]> {
    return await this.connection.billing.findMany({
      where: {
         status: BillingStatus.PENDING_PAYMENT,
         due_date: {lte: new Date()}, 
      },
    });
  }

  public async findExpiringBillings(remindAfterDate: Date): Promise<billing[]> {
    return await this.connection.billing.findMany({
      where: {
         status: BillingStatus.PENDING_PAYMENT,
         AND: [
          {
            due_date: {gt: remindAfterDate}, 
          },
          {
            NOT: {
              due_date: {lte: new Date()}, 
            },
          }
         ],
      },
    });
  }

  public async findBillingPayments(billingId: string): Promise<payment[]> {
    return await this.connection.payment.findMany({
      where: {
        billing_id: billingId, 
      },
    });
  }

  public async createNewBillings(billingsInput: any[]): Promise<void> {
    await this.connection.billing.createMany({
        data: billingsInput,
        skipDuplicates: true,
    });
  }

  public async executePayment(
    paidAmount: number,
    paidAt: Date,
    paidBy: string,
    billingId: string,
  ): Promise<payment> {
    return await this.connection.payment.create({
        data: {
          paid_amount: paidAmount,
          paid_at: paidAt,
          paid_by: paidBy,
          billing_id: billingId,
        },
    });
  }

  public async updateBillingStatus(billingId: string, newStatus: string): Promise<billing> {
    return await this.connection.billing.update({
      where: {
        id: billingId,
      },
      data: {
        status: newStatus,
      },
    });
  }
  
}