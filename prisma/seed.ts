import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const listName: string[] = ['alice', 'bob', 'robson', 'Liam', 'Olivia', 'Noah', 'Emma', 'Oliver', 'Charlotte', 'Elijah', 'Amelia', 'James', 'Ava', 'William', 'Sophia', 'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Henry', 'Evelyn', 'Theodore', 'Harper'];
const mailDomains: string[] = ['@gmail.com', '@mail.com', '@yahoo.com'];
const genders: string[] = ['Male', 'Female'];
// eslint-disable-next-line max-len
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomString = (length: number) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charactersLength = characters.length;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
const randomNumber = (length: number) => {
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const main = async () => {
  const customerIds: number[] = [];
  const createCustomers = async () => {
    const firstName = listName[Math.floor(Math.random() * listName.length)];
    const mailDomain = mailDomains[Math.floor(Math.random() * mailDomains.length)];
    const lastName = listName[Math.floor(Math.random() * listName.length)];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const birthDate = randomDate(new Date(1965, 0, 1), new Date(1998, 0, 1));
    const phoneNumber = randomNumber(12);

    await prisma.voucherTransactions.deleteMany();
    await prisma.purchaseTransaction.deleteMany();
    await prisma.customers.deleteMany();
    await prisma.vouchers.deleteMany();

    const customerQuery = await prisma.customers.upsert({
      where: { id: 0 },
      update: {},
      create: {
        first_name: firstName,
        last_name: lastName,
        gender,
        contact_number: phoneNumber,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}${mailDomain}`,
        date_of_birth: birthDate,
      },
    });
    customerIds.push(customerQuery.id);
    console.log(customerQuery);
  };

  const createVoucher = async () => {
    const voucherCode = randomString(8);

    const voucherQuery = await prisma.vouchers.upsert({
      where: { id: 0 },
      update: {},
      create: {
        voucher_code: voucherCode,
        value: Math.floor(((Math.random() * 500) / 10) * 10),
        start_time: randomDate(new Date(2022, 1, 1), new Date()),
        // eslint-disable-next-line max-len
        end_time: randomDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDay()), new Date(2022, 12, 20)),
      },
    });
    console.log(voucherQuery);
  };
  const createPurchaseTransactions = async () => {
    const transactionDate = randomDate(new Date(2022, 3, 1), new Date());

    const purchaseQuery = await prisma.purchaseTransaction.upsert({
      where: { id: 0 },
      update: {},
      create: {
        customer_id: customerIds[Math.floor(Math.random() * customerIds.length)],
        total_spent: Math.floor(Math.random() * 100),
        total_saving: Math.floor(Math.random() * 100),
        transaction_at: transactionDate,
      },
    });
    console.log(purchaseQuery);
  };

  const createCustomersPools: Promise<void>[] = [];
  const createVoucherPools: Promise<void>[] = [];
  const createPurchaseTransactionsPools: Promise<void>[] = [];

  // create 100 customer
  for (let i = 0; i < 100;) {
    createCustomersPools.push(createCustomers());
    i += 1;
  }
  await Promise.all(createCustomersPools);

  // create 1000 Voucher
  for (let i = 0; i < 1000;) {
    createVoucherPools.push(createVoucher());
    i += 1;
  }
  await Promise.all(createVoucherPools);

  // create 1500 transactions
  for (let i = 0; i < 1500;) {
    createPurchaseTransactionsPools.push(createPurchaseTransactions());
    i += 1;
  }
  await Promise.all(createPurchaseTransactionsPools);
};

main().then(async () => {
  await prisma.$disconnect();
}).catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
