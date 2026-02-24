import { AccountNumber } from "../value-objects/account-number.vo";
import { Email } from "../value-objects/email.vo";
import { UserId } from "../value-objects/user-id.vo";

export interface UserProps {
  id?: number;
  email: string;
  accountNumber: string;
}

export class User {
  private constructor(
    public readonly id: UserId | undefined,
    public readonly email: Email,
    public readonly accountNumber: AccountNumber,
  ) {
    Object.freeze(this);
  }

  static create(props: UserProps): User {
    return new User(
      props.id !== undefined ? UserId.create(props.id) : undefined,
      Email.create(props.email),
      AccountNumber.create(props.accountNumber),
    );
  }
}
