import { DataSource } from 'typeorm';
import { User, UserRole, UserStatus } from '../../entities/user.entity';

export async function seedAdminUser(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const adminEmail = 'admin@kumucoaching.com';
  const adminPassword = 'Admin123!@#';

  const existingAdmin = await userRepository.findOne({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const adminUser = userRepository.create({
      email: adminEmail,
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    });

    await userRepository.save(adminUser);
    console.log(`✅ Created admin user: ${adminEmail}`);
    console.log(`🔑 Admin password: ${adminPassword}`);
    console.log('⚠️  Please change the admin password after first login!');
  } else {
    console.log(`⏭️  Admin user already exists: ${adminEmail}`);
  }
}
