import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { InsertResult, Repository } from 'typeorm'

import { Token } from 'src/entity/token.entity'

import { TokenCreateDTO } from '../dto/token.dto'

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name)

  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  async insertIfNotExist(payload: TokenCreateDTO | TokenCreateDTO[]) {
    try {
      const tokens = this.tokenRepository
        .createQueryBuilder()
        .insert()
        .into(Token)
        .values(payload)
        .orIgnore()
        .execute()

      return tokens
    } catch (error) {}
  }

  async findTokenById(id: string): Promise<Token> {
    const token = await this.tokenRepository.findOne({ where: { id } })

    return token
  }
}
