import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { PuppeteerService } from './puppeteer.service';
import { CreatePuppeteerDto } from './dto/create-puppeteer.dto';
import { UpdatePuppeteerDto } from './dto/update-puppeteer.dto';

// import vanillaPuppeteer from 'puppeteer';
// import { addExtra } from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import { connect } from 'puppeteer-real-browser';
import type { Response } from 'express';

@Controller('puppeteer')
export class PuppeteerController {
  constructor(private readonly puppeteerService: PuppeteerService) {}

  @Post()
  create(@Body() createPuppeteerDto: CreatePuppeteerDto) {
    return this.puppeteerService.create(createPuppeteerDto);
  }

  @Get()
  async findAll(
    @Res() res: Response,
    @Query('device') device: string,
    @Query('url') url: string,
  ) {
    if (!url) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Url is required',
      });
    }
    const userAgent = new UserAgent({
      deviceCategory: device,
    });
    const { browser, page } = await connect({
      headless: true,

      args: ['--no-sandbox', '--disable-dev-shm-usage'],

      customConfig: {},

      turnstile: true,

      connectOption: {},

      disableXvfb: false,
      ignoreAllFlags: false,
      // proxy:{
      //     host:'<proxy-host>',
      //     port:'<proxy-port>',
      //     username:'<proxy-username>',
      //     password:'<proxy-password>'
      // }
      plugins: [StealthPlugin()],
    });
    console.log(userAgent.toString());
    await page.setUserAgent(userAgent.toString());
    await page.goto(url);

    // scroll lên xuống 30s
    const scrollHeight = (await page.evaluate(
      'document.body.scrollHeight',
    )) as number;
    const innerHeight = (await page.evaluate('window.innerHeight')) as number;
    const innerWidth = (await page.evaluate('window.innerWidth')) as number;
    const timeStart = Date.now();
    let posY = 0;
    let isDown = true;
    page.realCursor.toggleRandomMove(true);
    while (true) {
      await page.evaluate((posY) => {
        window.scrollTo(0, posY);
      }, posY);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (Date.now() - timeStart > 60000) {
        break;
      }
      if (posY >= scrollHeight) {
        isDown = false;
      }
      if (posY <= 0) {
        isDown = true;
      }
      if (isDown) {
        posY += 100;
      } else {
        posY -= 100;
      }
      if (posY >= scrollHeight) {
        posY = scrollHeight;
      }
      if (posY <= 0) {
        posY = 0;
      }

      // random x, y
      const randomX = Math.floor(Math.random() * innerWidth);
      const randomY = Math.floor(Math.random() * innerHeight);
      await page.realCursor.moveTo({
        x: randomX,
        y: randomY,
      });
      // click random
      await page.realCursor.click();
    }

    // console.log(`Testing iphey plugin..`);
    // await page.goto('https://iphey.com/');
    // await new Promise((resolve) => setTimeout(resolve, 5000));
    // await page.screenshot({ path: 'images/iphey.png', fullPage: true });
    // console.log(`Testing the stealth plugin..`);
    // await page.goto('https://bot.sannysoft.com');
    // await new Promise((resolve) => setTimeout(resolve, 5000));
    // await page.screenshot({ path: 'images/stealth.png', fullPage: true });
    // console.log(`Testing the fingerprint plugin..`);
    // await page.goto('https://demo.fingerprint.com/playground');
    // await new Promise((resolve) => setTimeout(resolve, 5000));
    // console.log(`Testing the bot detection plugin..`);
    // await page.goto('https://botd-widget.fpjs.sh/');
    // await new Promise((resolve) => setTimeout(resolve, 5000));
    // await page.screenshot({ path: 'images/bot-detection.png', fullPage: true });
    // await page.goto('https://httpbin.org/headers', {
    //   waitUntil: 'domcontentloaded',
    // });
    // const content = await page.content();
    // console.log(content);
    await page.screenshot({ path: 'images/result.png', fullPage: false });
    console.log(`All done, check the screenshots. ✨`);
    await browser.close();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.puppeteerService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePuppeteerDto: UpdatePuppeteerDto,
  ) {
    return this.puppeteerService.update(+id, updatePuppeteerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.puppeteerService.remove(+id);
  }
}
