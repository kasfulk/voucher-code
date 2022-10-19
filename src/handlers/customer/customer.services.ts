import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export default class VoucherServices {
  private prisma = new PrismaClient()

  getAll = async (req: Request, res: Response): Promise<void> => {
    const results = await this.prisma.customers.findMany();
    res.send(results);
  };

  getId = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await this.prisma.customers.findFirst({
      where: { id: Number(id) },
    });
    res.send(result);
  };
}
