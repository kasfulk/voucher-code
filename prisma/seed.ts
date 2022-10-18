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

const main = async () => {
  const createCustomers = async () => {
    const firstName = listName[Math.floor(Math.random() * listName.length)];
    const mailDomain = mailDomains[Math.floor(Math.random() * mailDomains.length)];
    const lastName = listName[Math.floor(Math.random() * listName.length)];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const birthDate = randomDate(new Date(1965, 0, 1), new Date(1998, 0, 1));
    const phoneNumber = Math.floor(Math.random() * 20);

    await prisma.$queryRaw`TRUNCATE TABLE Customers`;
    await prisma.$queryRaw`TRUNCATE TABLE Vouchers`;

    const customerQuery = await prisma.customers.upsert({
      where: { id: 0 },
      update: {},
      create: {
        first_name: firstName,
        last_name: lastName,
        gender,
        contact_number: String(phoneNumber),
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}${mailDomain}`,
        date_of_birth: birthDate,
      },
    });
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
      },
    });
    console.log(voucherQuery);
  };
  const createCustomersPools: Promise<void>[] = [];
  const createVoucherPools: Promise<void>[] = [];
  // create 100 customer
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 100; i++) {
    createCustomersPools.push(createCustomers());
  }
  await Promise.all(createCustomersPools);

  // create 1000 Voucher
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 1000; i++) {
    createVoucherPools.push(createVoucher());
  }
  await Promise.all(createVoucherPools);
};

main().then(async () => {
  await prisma.$disconnect();
}).catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
