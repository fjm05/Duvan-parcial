import { ConflictException, Injectable } from '@nestjs/common';
import { ReservationEntity } from './entities/reservation.entity';

@Injectable()
export class ReservationRulesService {
  ensureCanCancel(reservation: ReservationEntity): void {
    if (reservation.status === 'cancelled') {
      throw new ConflictException('Reservation is already cancelled');
    }
  }
}
