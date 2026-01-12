import { Controller, Inject } from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { CategoriesService } from "./categories.service";

@Controller()
export class CategoriesController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly categoriesService: CategoriesService,
  ) {}
}
