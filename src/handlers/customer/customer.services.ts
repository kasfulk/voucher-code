import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
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
      const checkLocked = await this.voucher.checkLocked(Number(id));
      res.send({
        ...result,
        is_eligible: checkEligible.length > 0,
        lockedVoucher: { ...checkLocked[0] },
      });
    } catch (error) {
      if (error.name === 'NotFoundError') {
        res.status(404).send(error);
        return;
      }
      res.status(500).send(error);
    }
  };

  validateCostumer = async (req: Request, res: Response): Promise<void> => {
    const { face_recognition } = req.body;
    const { id: customer_id } = req.params;
    const [dbTime]: any = await this.prisma.$queryRaw`SELECT NOW() TimeNow`;

    if (!req.file) {
      res.status(422).send({
        message: 'Problem in uploading file!',
      });
      return;
    }

    const [
      checkEligible,
      voucherData,
      checkLocked,
    ] = await Promise.all([
      this.voucher.checkEligible(Number(customer_id)),
      this.prisma.$queryRaw(
        Prisma.sql`SELECT
                    * 
                  FROM
                    Vouchers 
                  WHERE
                    id NOT IN ( SELECT voucher_id FROM VoucherTransactions ) 
                    AND id NOT IN (
                    SELECT
                      id 
                    FROM
                      Vouchers 
                    WHERE
                      locked_at BETWEEN SUBDATE( NOW(), INTERVAL 10 MINUTE ) 
                    AND NOW()) 
                  ORDER BY
                    id 
                    LIMIT 1`,
      ),
      this.voucher.checkLocked(Number(customer_id)),
    ]);

    const isEligble = checkEligible.length > 0;
    const availableVouchercode = voucherData[0];

    if (!isEligble) {
      res.send({
        message: 'Customer is not eligible for participating!',
      });
      await fs.unlink(req.file.path);
      return;
    }

    if (!Number(face_recognition)) {
      res.send({
        message: 'Face is in invalid recognition!',
      });
      await fs.unlink(req.file.path);
      return;
    }

    if (!availableVouchercode) {
      res.send({
        message: 'The campaign are finished, all voucher are gone!',
      });
      await fs.unlink(req.file.path);
      return;
    }

    if (checkLocked.length > 0) {
      res.send({
        message: 'Voucher was locked! if you want to validate, please wait 10 minutes for validating again.',
      });
      await fs.unlink(req.file.path);
      return;
    }

    const lockTheVoucher = await this.prisma.vouchers.update({
      where: {
        id: Number(availableVouchercode.id),
      },
      data: {
        locked_at: dbTime.TimeNow,
        locked_by: Number(customer_id),
      },
      select: {
        voucher_code: true,
        customer_locked: true,
      },
    });

    res.send(lockTheVoucher);
  }

  redeemVoucherCustomer = async (req: Request, res: Response): Promise<void> => {
    const { voucher_code, purchase_id } = req.body;
    const { id: customer_id } = req.params;

    if (!voucher_code || !purchase_id) {
      res.status(422).send({
        message: 'Invalid request!',
      });
      return;
    }

    const [
      checkEligible,
      checkVoucherValid,
      voucherData,
      purchaseData,
      findVoucherTransaction,
      findVoucherCustTransaction,
      checkLocked,
    ] = await Promise.all([
      this.voucher.checkEligible(Number(customer_id)),
      this.voucher.checkVoucherValid(voucher_code),
      this.prisma.vouchers.findFirst({
        where: {
          voucher_code,
        },
      }),
      this.prisma.purchaseTransaction.findMany({
        where: {
          customer_id: Number(customer_id),
          id: Number(purchase_id),
        },
      }),
      this.prisma.voucherTransactions.findMany({
        where: {
          Vouchers: {
            voucher_code,
          },
        },
      }),
      this.prisma.voucherTransactions.findMany({
        where: {
          customer: {
            id: Number(customer_id),
          },
        },
      }),
      this.voucher.checkLockedCustomer(Number(customer_id), voucher_code),
    ]);

    const isEligble = checkEligible.length > 0;

    if (purchaseData.length === 0) {
      res.send({
        message: 'Purchase is not found on this customer!',
      });
      return;
    }

    if (findVoucherTransaction.length > 0) {
      res.send({
        message: 'Voucher was redeemed!',
      });
      return;
    }

    if (findVoucherCustTransaction.length > 0) {
      res.send({
        message: 'This customer was redeemed a voucher!',
      });
      return;
    }

    if (!isEligble) {
      res.send({
        message: 'Customer is not eligible for participating!',
      });
      return;
    }

    if (!checkVoucherValid) {
      res.send({
        message: 'Voucher is not valid!',
      });
      return;
    }

    if (checkLocked.length === 0) {
      res.send({
        message: 'Voucher is locked down by another customer or submission exceed more than 10 minutes!',
      });
      return;
    }

    // prisma bug, can't get time with equal timezone
    const [dbTime]: any = await this.prisma.$queryRaw`SELECT NOW() TimeNow`;

    // redeem voucher
    const voucherTx = await this.prisma.voucherTransactions.upsert({
      where: { id: 0 },
      update: {},
      create: {
        customer_id: Number(customer_id),
        voucher_id: voucherData.id,
        purchase_id: Number(purchase_id),
        redeemed_at: dbTime.TimeNow,
      },
      select: {
        Vouchers: true,
        customer: true,
        purchase: true,
      },
    });

    res.send({
      message: 'The Voucher has been redeemed',
      data: { voucherTx },
    });
  }
}
