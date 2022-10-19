import { Router } from 'express';
import CustomerServices from './customer.services';

export default class CustomerController {
  public path = '/customer';

  public router: Router = Router();

  private customerService: CustomerServices = new CustomerServices();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this.router.get(this.path, this.customerService.getAll);
    this.router.get(`${this.path}/:id`, this.customerService.getId);
  }
}
