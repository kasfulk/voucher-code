import { Router } from 'express';
import VoucherServices from './voucher.services';
// import { JalanTypes } from './jalan.types';

export default class VoucherController {
  public path = '/voucher';

  public router: Router = Router();

  private voucherService: VoucherServices = new VoucherServices();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this.router.get(this.path, this.voucherService.getAll);
    this.router.get(`${this.path}/:id`, this.voucherService.getId);
  }
}
