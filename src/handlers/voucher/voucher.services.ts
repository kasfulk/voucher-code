import { Request, Response } from 'express';
import pool from '@services/db';
import { PrismaClient } from '@prisma/client';

export default class VoucherServices {
  private prisma = new PrismaClient()

  getAll = async (req: Request, res: Response): Promise<void> => {
    const [rows, fields] = await pool.execute('SELECT * FROM jalan');

    res.send({
      fields: fields.map((field) => field.name),
      data: rows,
    });
  };

  getId = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const [rows, fields] = await pool.execute(
      'SELECT * FROM jalan WHERE id_jalan = ?',
      [id],
    );

    res.send({
      fields: fields.map((field) => field.name),
      data: rows,
    });
  };
}
