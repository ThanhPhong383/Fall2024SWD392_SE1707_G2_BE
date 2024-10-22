import { PrismaClient } from '../../prisma-client'; // Đảm bảo đường dẫn tới Prisma Client chính xác
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Mã hóa mật khẩu
    const hashedPassword = await hash('adminpassword123', 10);

    // Tạo admin trong bảng Users
    const admin = await prisma.users.create({
      data: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: hashedPassword,
        phone: '0123456789',
        dateOfBirth: new Date('1990-01-01'),
        address: '123 Admin Street, City, Country',
        role: 'admin', // Đảm bảo có trường role trong database để phân biệt
        isActive: true,
        createdDate: new Date(),
      },
    });

    console.log('Admin created:', admin);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
