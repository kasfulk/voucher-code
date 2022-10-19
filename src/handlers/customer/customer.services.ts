import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import VoucherServices from '../voucher/voucher.services';

export default class CustomerServices {
  private prisma = new PrismaClient()

  private voucher= new VoucherServices()

  getAll = async (req: Request, res: Response): Promise<void> => {
    const results = await this.prisma.customers.findMany();
    res.send(results);
  };

  getId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.prisma.customers.findFirstOrThrow({
        where: { id: Number(id) },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          contact_number: true,
          email: true,
          PurchaseTransaction: true,
        },
      });
      const checkEligible = await this.voucher.checkEligible(Number(id));
      console.log(result);
      res.send({ ...result, is_eligible: checkEligible.length > 0 });
    } catch (error) {
      if (error.name === 'NotFoundError') {
        res.status(404).send(error);
        return;
      }
      res.status(500).send(error);
    }
  };

  validateCustomer = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).send({
        message: 'Terdapat kesalahan pada upload!',
      });
    }
    res.send(null);
  }
}
