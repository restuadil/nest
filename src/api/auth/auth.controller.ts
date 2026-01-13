import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { Public } from "src/common/decorators/public.decorator";
import { ZodPipe } from "src/common/pipes/zod.pipe";
import { ControllerResponse } from "src/types/web.type";

import { AuthService } from "./auth.service";
import {
  type RegisterDto,
  RegisterResponseDto,
  registerSchema,
} from "./dto/register.dto";

@Controller("api/auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post("register")
  async register(
    @Body(new ZodPipe(registerSchema)) registerDto: RegisterDto,
  ): Promise<ControllerResponse<RegisterResponseDto>> {
    this.logger.info(`AuthController.register`);
    const reult = await this.authService.register(registerDto);
    return { message: "User registered successfully", data: reult };
  }
}
