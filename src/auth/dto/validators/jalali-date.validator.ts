import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { isValidJalaliDate } from '../../utils/jalali-date.util';

@ValidatorConstraint({ async: false })
export class IsJalaliDateConstraint implements ValidatorConstraintInterface {
  validate(birthDate: any, args: ValidationArguments) {
    if (!birthDate) return true; // Optional field
    if (typeof birthDate !== 'string') return false;
    return isValidJalaliDate(birthDate);
  }

  defaultMessage(args: ValidationArguments) {
    return 'فرمت تاریخ تولد نامعتبر است. فرمت صحیح: YYYY/MM/DD (شمسی)';
  }
}

export function IsJalaliDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsJalaliDateConstraint,
    });
  };
}

