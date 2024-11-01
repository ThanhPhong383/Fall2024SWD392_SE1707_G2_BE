import { SetMetadata } from '@nestjs/common';
import { Roles } from '../types/roles.enum';

export const SetRoles = (role: Roles) => SetMetadata('role', role);
