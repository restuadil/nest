import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  Res,
} from "@nestjs/common";

import { type Response } from "express";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { Public } from "src/common/decorators/public.decorator";
import { ZodPipe } from "src/common/pipes/zod.pipe";
import { ControllerResponse } from "src/types/web.type";

import { AuthService } from "./auth.service";
import { activationSchema, type ActivationDto } from "./dto/activation.dto";
import { type LoginDto, loginSchema } from "./dto/login.dto";
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

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @Public()
  async login(
    @Body(new ZodPipe(loginSchema)) loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ControllerResponse<{ accessToken: string }>> {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return {
      message: "User logged in successfully",
      data: { accessToken },
    };
  }

  @Get("activate")
  @HttpCode(HttpStatus.OK)
  @Public()
  async activate(
    @Query(new ZodPipe(activationSchema)) activationDto: ActivationDto,
  ): Promise<ControllerResponse<RegisterResponseDto>> {
    const result = await this.authService.activate(activationDto);
    return { message: "User activated successfully", data: result };
  }
}
