import { User } from 'src/users/entities/user.entity';
import * as Faker from 'faker';
import { define, factory } from 'typeorm-factories';

define(User, (faker: typeof Faker) => {
  const user = new User();
  user.firstName = faker.name.firstName();
  user.lastName = faker.name.lastName();
  user.email = faker.internet.email();
  user.pwdHash = 'password';
  user.currentTokenId = '';

  return user;
});

export async function buildUser(attrs: Partial<User> = {}) {
  return factory(User).make(attrs);
}

export async function createUser(attrs: Partial<User> = {}) {
  const user = await buildUser(attrs);
  return user.save();
}
