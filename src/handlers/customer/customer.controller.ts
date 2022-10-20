import { Router, Request, Express } from 'express';
import multer, { FileFilterCallback } from 'multer';
import CustomerServices from './customer.services';

export default class CustomerController {
  public path = '/customer';

  public storage = multer.diskStorage({
    destination: 'public/uploads',
    filename(req: Request, file: Express.Multer.File, callback:any) {
      const microtime = Date.now();
      callback(null, `${microtime}_${file.originalname}`);
    },
  })

  public upload = multer({
    storage: this.storage,
    fileFilter(req: Request, file: Express.Multer.File, callback: FileFilterCallback) {
      const allowedType = ['image/png', 'image/jpg', 'image/jpeg'];
      if (allowedType.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
  })

  public router: Router = Router();

  private customerService: CustomerServices = new CustomerServices();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this.router.get(this.path, this.customerService.getAll);
    this.router.get(`${this.path}/:id`, this.customerService.getId);
    this.router.post(`${this.path}/:id/validate`, this.upload.single('photo'), this.customerService.validateCostumer);
    this.router.post(`${this.path}/:id/redeem-voucher`, this.customerService.redeemVoucherCustomer);
  }
}
