import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

export default class VoucherServices {
  private prisma = new PrismaClient()

  checkEligible = async (customerId: number) => {
    const checkEligible: any[] = await this.prisma.$queryRaw(
      Prisma.sql`SELECT
            COUNT( a.id ) completed_total_transaction,
            ROUND(
            SUM( total_spent ) + SUM( total_saving )) total_transaction,
            a.customer_id 
          FROM
            PurchaseTransaction a
            LEFT JOIN Customers b ON a.customer_id = b.id 
          WHERE
            a.customer_id = ${customerId}
            AND transaction_at BETWEEN SUBDATE( NOW(), INTERVAL 30 DAY ) 
            AND NOW() 
            AND customer_id NOT IN ( SELECT customer_id FROM VoucherTransactions ) 
          GROUP BY
            customer_id 
          HAVING
            COUNT( a.id ) >= 3 
            AND SUM( total_spent ) + SUM( total_saving ) >= 100`,
    );
    return checkEligible;
  }

  checkVoucherValid = async (voucherCode: string) => {
    try {
      const result: any[] = await this.prisma.vouchers.findMany({
        where: {
          voucher_code: voucherCode,
          start_time: {
            lte: new Date(),
          },
          end_time: {
            gte: new Date(),
          },
        },
      });
      if (result.length > 0) {
        return true;
      }
      return false;
    } catch (error) {
      return error;
    }
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    const results = await this.prisma.vouchers.findMany();
    res.send(results);
  };

  getId = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const result = await this.prisma.vouchers.findFirstOrThrow({
        where: {
          OR: [
            { id: isNaN(Number(id)) ? 0 : Number(id) },
            { voucher_code: id },
          ],
        },
      });
      const voucherValid = await this.checkVoucherValid(result.voucher_code);
      if (!result) {
        res.status(404).send({
          message: 'Data not found!',
        });
      }
      res.send({ ...result, is_valid: voucherValid });
    } catch (error) {
      if (error.name === 'NotFoundError') {
        res.status(404).send(error);
        return;
      }
      res.status(500).send(error);
    }
  };

  getEligible = async (req:Request, res: Response) => {
    try {
      const { customerId } = req.query;
      if (!customerId) {
        res.status(400).send({
          message: 'Customer id not found!',
        });
      }

      const eligible = await this.checkEligible(Number(customerId));

      if (eligible.length === 0) {
        res.status(404).send({
          eligible: false,
          message: 'Customer is not eligible for participating!',
        });
      } else {
        res.send({
          eligible: true,
          message: 'Customer is eligible for participating!',
        });
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }
}
