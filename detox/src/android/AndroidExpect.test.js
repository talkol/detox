describe('expect', () => {
  let e;

  let mockExecutor;
  let emitter;
  let device;

  beforeEach(() => {
    jest.mock('tempfile');
    jest.mock('fs-extra');

    mockExecutor = new MockExecutor();

    const Emitter = jest.genMockFromModule('../utils/AsyncEmitter');
    emitter = new Emitter();

    device = {
      typeText: jest.fn(),
    };

    const AndroidExpect = require('./AndroidExpect');
    e = new AndroidExpect({
      invocationManager: mockExecutor,
      device,
      emitter,
    });
  });

  describe('native', () => {
    it(`element by accessibilityLabel`, async () => {
      await e.expect(e.element(e.by.accessibilityLabel('test'))).toBeVisible();
      await e.expect(e.element(e.by.accessibilityLabel('test'))).toBeNotVisible();
      await e.expect(e.element(e.by.accessibilityLabel('test'))).not.toBeVisible();
      await e.expect(e.element(e.by.accessibilityLabel('test'))).toExist();
      await e.expect(e.element(e.by.accessibilityLabel('test'))).toNotExist();
      await e.expect(e.element(e.by.accessibilityLabel('test'))).not.toExist();
      await e.expect(e.element(e.by.accessibilityLabel('test'))).toHaveText('text');
      await e.expect(e.element(e.by.accessibilityLabel('test'))).toNotHaveText('text');
      await e.expect(e.element(e.by.accessibilityLabel('test'))).not.toHaveText('text');
      await e.expect(e.element(e.by.accessibilityLabel('test'))).toHaveLabel('label');
      await e.expect(e.element(e.by.accessibilityLabel('test'))).toNotHaveLabel('label');
      await e.expect(e.element(e.by.accessibilityLabel('test'))).not.toHaveLabel('label');
      await e.expect(e.element(e.by.accessibilityLabel('test'))).toHaveId('id');
      await e.expect(e.element(e.by.accessibilityLabel('test'))).toNotHaveId('id');
      await e.expect(e.element(e.by.accessibilityLabel('test'))).not.toHaveId('id');
      await e.expect(e.element(e.by.accessibilityLabel('test'))).toHaveValue('value');
      await e.expect(e.element(e.by.accessibilityLabel('test'))).toNotHaveValue('value');
      await e.expect(e.element(e.by.accessibilityLabel('test'))).not.toHaveValue('value');
      await e.expect(e.element(e.by.accessibilityLabel('test'))).toHaveToggleValue(true);
      await e.expect(e.element(e.by.accessibilityLabel('test'))).not.toHaveToggleValue(true);
    });

    it(`element by label (for backwards compat)`, async () => {
      await e.expect(e.element(e.by.label('test'))).toBeVisible();
      await e.expect(e.element(e.by.label('test'))).toBeNotVisible();
      await e.expect(e.element(e.by.label('test'))).toExist();
      await e.expect(e.element(e.by.label('test'))).toNotExist();
      await e.expect(e.element(e.by.label('test'))).toHaveText('text');
      await e.expect(e.element(e.by.label('test'))).toHaveLabel('label');
      await e.expect(e.element(e.by.label('test'))).toHaveId('id');
      await e.expect(e.element(e.by.label('test'))).toHaveValue('value');
      await e.expect(e.element(e.by.label('test'))).toHaveToggleValue(false);
      await e.expect(e.element(e.by.label('test'))).not.toHaveToggleValue(false);
    });

    it(`element by id`, async () => {
      await e.expect(e.element(e.by.id('test'))).toBeVisible();
    });

    it(`element by type`, async () => {
      await e.expect(e.element(e.by.type('test'))).toBeVisible();
    });

    it(`element by traits`, async () => {
      await e.expect(e.element(e.by.traits(['button', 'link', 'header', 'search']))).toBeVisible();
      await e.expect(e.element(e.by.traits(['image', 'selected', 'plays', 'key']))).toBeNotVisible();
      await e.expect(e.element(e.by.traits(['text', 'summary', 'disabled', 'frequentUpdates']))).toBeNotVisible();
      await e.expect(e.element(e.by.traits(['startsMedia', 'adjustable', 'allowsDirectInteraction', 'pageTurn']))).toBeNotVisible();
    });

    it(`matcher helpers`, async () => {
      await e.expect(e.element(e.by.id('test').withAncestor(e.by.id('ancestor')))).toBeVisible();
      await e.expect(e.element(e.by.id('test').withDescendant(e.by.id('descendant')))).toBeVisible();
      await e.expect(e.element(e.by.id('test').and(e.by.type('type')))).toBeVisible();
      await e.expect(e.element(e.by.id('test'))).not.toBeVisible();
      await e.expect(e.element(e.by.id('test').or(e.by.id('test2')))).toBeVisible();
    });

    it(`expect with wrong parameters should throw`, async () => {
      await expectToThrow(() => e.expect('notAnElement'));
      await expectToThrow(() => e.expect(e.element('notAMatcher')));
    });

    it(`matchers with wrong parameters should throw`, async () => {
      await expectToThrow(() => e.element(e.by.label(5)));
      await expectToThrow(() => e.element(e.by.accessibilityLabel(5)));
      await expectToThrow(() => e.element(e.by.id(5)));
      await expectToThrow(() => e.element(e.by.type(0)));
      await expectToThrow(() => e.by.traits(1));
      await expectToThrow(() => e.by.traits(['nonExistentTrait']));
      await expectToThrow(() => e.element(e.by.value(0)));
      await expectToThrow(() => e.element(e.by.text(0)));
      await expectToThrow(() => e.element(e.by.id('test').withAncestor('notAMatcher')));
      await expectToThrow(() => e.element(e.by.id('test').withDescendant('notAMatcher')));
      await expectToThrow(() => e.element(e.by.id('test').and('notAMatcher')));
      await expectToThrow(() => e.element(e.by.id('test').or('notAMatcher')));
    });

    it(`waitFor (element)`, async () => {
      await e.waitFor(e.element(e.by.id('id'))).toExist().withTimeout(0);
      await e.waitFor(e.element(e.by.id('id'))).not.toExist().withTimeout(0);
      await e.waitFor(e.element(e.by.id('id'))).toBeVisible();
      await e.waitFor(e.element(e.by.id('id'))).toBeNotVisible();
      await e.waitFor(e.element(e.by.id('id'))).toExist();
      await e.waitFor(e.element(e.by.id('id'))).toExist().withTimeout(0);
      await e.waitFor(e.element(e.by.id('id'))).toNotExist().withTimeout(0);

      await e.waitFor(e.element(e.by.id('id'))).toHaveText('text');
      await e.waitFor(e.element(e.by.id('id'))).toNotHaveText('value');
      await e.waitFor(e.element(e.by.id('id'))).not.toHaveText('text');

      await e.waitFor(e.element(e.by.id('id'))).toHaveLabel('text');
      await e.waitFor(e.element(e.by.id('id'))).toNotHaveLabel('text');
      await e.waitFor(e.element(e.by.id('id'))).not.toHaveLabel('text');

      await e.waitFor(e.element(e.by.id('id'))).toHaveId('id');
      await e.waitFor(e.element(e.by.id('id'))).toNotHaveId('id');
      await e.waitFor(e.element(e.by.id('id'))).not.toHaveId('id');

      await e.waitFor(e.element(e.by.id('id'))).toHaveValue('value');
      await e.waitFor(e.element(e.by.id('id'))).toNotHaveValue('value');
      await e.waitFor(e.element(e.by.id('id'))).not.toHaveValue('value');

      await e.waitFor(e.element(e.by.id('id'))).toBeVisible().whileElement(e.by.id('id2')).scroll(50, 'down');
      await e.waitFor(e.element(e.by.id('id'))).toBeVisible().whileElement(e.by.id('id2')).scroll(50);

    });

    it(`waitFor (element) with wrong parameters should throw`, async () => {
      await expectToThrow(() => e.waitFor('notAnElement'));
      await expectToThrow(() => e.waitFor(e.element(e.by.id('id'))).toExist().withTimeout('notANumber'));
      await expectToThrow(() => e.waitFor(e.element(e.by.id('id'))).toExist().withTimeout(-1));
      await expectToThrow(() => e.waitFor(e.element(e.by.id('id'))).toBeVisible().whileElement('notAnElement'));
    });

    it(`waitFor (element) with non-elements should throw`, async () => {
      await expectToThrow(() => e.waitFor('notAnElement').toBeVisible());
    });

    describe('element interactions', () => {
      it('should tap and long-press', async () => {
        await e.element(e.by.label('Tap Me')).tap();
        await e.element(e.by.label('Tap Me')).tap({ x: 10, y: 10 });
        await e.element(e.by.label('Tap Me')).tapAtPoint({x: 100, y: 200});
        await e.element(e.by.label('Tap Me')).longPress();
        await e.element(e.by.id('UniqueId819')).multiTap(3);
      });

      it('should not tap and long-press given bad args', async () => {
        await expectToThrow(() => e.element(e.by.id('UniqueId819')).multiTap('NaN'));
      });

      it('should press special keys', async () => {
        await e.element(e.by.id('UniqueId937')).tapBackspaceKey();
        await e.element(e.by.id('UniqueId937')).tapReturnKey();
      });

      it('should edit text', async () => {
        await e.element(e.by.id('UniqueId937')).typeText('passcode');
        await e.element(e.by.id('UniqueId005')).clearText();
        await e.element(e.by.id('UniqueId005')).replaceText('replaceTo');
      });

      it('should not edit text given bad args', async () => {
        await expectToThrow(() => e.element(e.by.id('UniqueId937')).typeText(0));
        await expectToThrow(() => e.element(e.by.id('UniqueId005')).replaceText(3));
      });

      it('should scroll', async () => {
        await e.element(e.by.id('ScrollView161')).scroll(100);
        await e.element(e.by.id('ScrollView161')).scroll(100, 'down');
        await e.element(e.by.id('ScrollView161')).scroll(100, 'up');
        await e.element(e.by.id('ScrollView161')).scroll(100, 'right');
        await e.element(e.by.id('ScrollView161')).scroll(100, 'left');
        await e.element(e.by.id('ScrollView161')).scrollTo('bottom');
        await e.element(e.by.id('ScrollView161')).scrollTo('top');
        await e.element(e.by.id('ScrollView161')).scrollTo('left');
        await e.element(e.by.id('ScrollView161')).scrollTo('right');
      });

      it('should not scroll given bad args', async () => {
        await expectToThrow(() => e.element(e.by.id('ScrollView161')).scroll('NaN', 'down'));
        await expectToThrow(() => e.element(e.by.id('ScrollView161')).scroll(100, 'noDirection'));
        await expectToThrow(() => e.element(e.by.id('ScrollView161')).scroll(100, 0));
        await expectToThrow(() => e.element(e.by.id('ScrollView161')).scrollTo(0));
        await expectToThrow(() => e.element(e.by.id('ScrollView161')).scrollTo('noDirection'));
      });

      it('should swipe', async () => {
        await e.element(e.by.id('ScrollView799')).swipe('down');
        await e.element(e.by.id('ScrollView799')).swipe('down', 'fast');
        await e.element(e.by.id('ScrollView799')).swipe('up', 'slow');
        await e.element(e.by.id('ScrollView799')).swipe('left', 'fast');
        await e.element(e.by.id('ScrollView799')).swipe('right', 'slow');
        await e.element(e.by.id('ScrollView799')).swipe('down', 'fast', 0.9);
        await e.element(e.by.id('ScrollView799')).swipe('up', 'slow', 0.9);
        await e.element(e.by.id('ScrollView799')).swipe('left', 'fast', 0.9);
        await e.element(e.by.id('ScrollView799')).swipe('right', 'slow', 0.9);
        await e.element(e.by.id('ScrollView799')).swipe('down', 'fast', undefined, undefined, 0.25);
        await e.element(e.by.id('ScrollView799')).swipe('up', 'slow', 0.9, 0.5, 0.5);
      });

      it('should not swipe given bad args', async () => {
        await expectToThrow(() => e.element(e.by.id('ScrollView799')).swipe(4, 'fast'));
        await expectToThrow(() => e.element(e.by.id('ScrollView799')).swipe('noDirection', 0));
        await expectToThrow(() => e.element(e.by.id('ScrollView799')).swipe('noDirection', 'fast'));
        await expectToThrow(() => e.element(e.by.id('ScrollView799')).swipe('down', 'NotFastNorSlow'));
        await expectToThrow(() => e.element(e.by.id('ScrollView799')).swipe('down', 'NotFastNorSlow', 0.9));
      });

      it('should allow for index-based element discrepancy resolution', async () => {
        await e.element(e.by.id('ScrollView799')).atIndex(1);
      });

      it('should fail to find index-based element given invalid args', async () => {
        await expectToThrow(() => e.element(e.by.id('ScrollView799')).atIndex('NaN'));
      });
    });

    describe('element screenshots', () => {
      const tempFilePath = '/path/to/temp-file.png';
      const invokeResultInBase64 = 'VGhlcmUgaXMgbm8gc3Bvb24h';

      let tempfile;
      let fs;
      let _element;
      beforeEach(() => {
        mockExecutor.executeResult = Promise.resolve(invokeResultInBase64);

        fs = require('fs-extra');
        tempfile = require('tempfile');
        tempfile.mockReturnValue(tempFilePath);

        _element = e.element(e.by.id('FancyElement'));
      });

      it('should take and save the screenshot in a temp-file', async () => {
        await _element.takeScreenshot();
        expect(fs.writeFile).toHaveBeenCalledWith(tempFilePath, invokeResultInBase64, 'base64');
        expect(tempfile).toHaveBeenCalledWith('detox.element-screenshot.png');
      });

      it('should return the path to the temp-file containing screenshot data', async () => {
        const result = await _element.takeScreenshot();
        expect(result).toEqual(tempFilePath);
      });

      it('should emit a named-artifact creation event', async () => {
        const screenshotName = 'mock-screenshot-name';
        await _element.takeScreenshot(screenshotName);
        expect(emitter.emit).toHaveBeenCalledWith('createExternalArtifact', {
          pluginId: 'screenshot',
          artifactName: screenshotName,
          artifactPath: tempFilePath,
        });
      });

      it('should emit an artifact creation event with a default name', async () => {
        await _element.takeScreenshot(undefined);
        expect(emitter.emit).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
              artifactName: 'temp-file',
            },
          ));
      });
    });
  });

  describe('web', () => {
    describe('General', () => {
      it('should return undefined', async () => {
        mockExecutor.executeResult = Promise.resolve(undefined);
        await e.web(e.by.id('webview_id')).element(e.by.htmlId('any')).tap();
      });
    })

    describe('web', () => {

      it('default', async () => {
        await e.web.element(e.by.htmlId('id')).tap();
      });

      it('default explicit', async () => {
        await e.web().element(e.by.htmlId('id')).tap();
      });

      it('with webview matcher', async () => {
        await e.web(e.by.id('webview_id')).element(e.by.htmlId('id')).tap();
      });

      it(`with wrong matcher should throw`, async () => {
        await expectToThrow(() => e.web(e.by.className('webMatcher')));
        await expectToThrow(() => e.web(e.by.cssSelector('webMatcher')));
        await expectToThrow(() => e.web(e.by.htmlId('webMatcher')));
        await expectToThrow(() => e.web(e.by.linkText('webMatcher')));
        await expectToThrow(() => e.web(e.by.name('webMatcher')));
        await expectToThrow(() => e.web(e.by.partialLinkText('webMatcher')));
        await expectToThrow(() => e.web(e.by.tag('webMatcher')));
        await expectToThrow(() => e.web(e.by.xpath('webMatcher')));
      });

      it(`inner element with wrong matcher should throw`, async () => {
        await expectToThrow(() => e.web.element(e.by.accessibilityLabel('nativeMatcher')));
        await expectToThrow(() => e.web.element(e.by.id('nativeMatcher')));
        await expectToThrow(() => e.web.element(e.by.label('nativeMatcher')));
        await expectToThrow(() => e.web.element(e.by.text('nativeMatcher')));
        await expectToThrow(() => e.web.element(e.by.traits('nativeMatcher')));
        await expectToThrow(() => e.web.element(e.by.value('nativeMatcher')));
      });
    });

    describe('WebElement Actions', () => {
      it('tap', async () => {
        await e.web.element(e.by.htmlId('id')).tap();
        await e.web.element(e.by.className('className')).tap();
        await e.web.element(e.by.cssSelector('cssSelector')).tap();
        await e.web.element(e.by.name('name')).tap();
        await e.web.element(e.by.xpath('xpath')).tap();
        await e.web.element(e.by.linkText('linkText')).tap();
        await e.web.element(e.by.partialLinkText('partialLinkText')).tap();
        await e.web.element(e.by.tag('tag')).tap();
      });

      it('typeText', async () => {
        await e.web.element(e.by.htmlId('id')).typeText('text');
        await e.web.element(e.by.className('className')).typeText('text');
        await e.web.element(e.by.cssSelector('cssSelector')).typeText('text');
        await e.web.element(e.by.name('name')).typeText('text');
        await e.web.element(e.by.xpath('xpath')).typeText('text');
        await e.web.element(e.by.linkText('linkText')).typeText('text');
        await e.web.element(e.by.partialLinkText('partialLinkText')).typeText('text');
        await e.web.element(e.by.tag('tag')).typeText('text');
      });

      it('typeText with isContentEditable=false', async () => {
        await e.web.element(e.by.htmlId('id')).typeText('text', false);
        global.expect(device.typeText).not.toHaveBeenCalled();
      });

      it('typeText with isContentEditable=true', async () => {
        await e.web.element(e.by.htmlId('id')).typeText('text', true);
        global.expect(device.typeText).toHaveBeenCalled();
      });

      it('typeText default isContentEditable is false', async () => {
        await e.web.element(e.by.htmlId('id')).typeText('text');
        global.expect(device.typeText).not.toHaveBeenCalled();
      });

      it('replaceText', async () => {
        await e.web.element(e.by.htmlId('id')).replaceText('text');
        await e.web.element(e.by.className('className')).replaceText('text');
        await e.web.element(e.by.cssSelector('cssSelector')).replaceText('text');
        await e.web.element(e.by.name('name')).replaceText('text');
        await e.web.element(e.by.xpath('xpath')).replaceText('text');
        await e.web.element(e.by.linkText('linkText')).replaceText('text');
        await e.web.element(e.by.partialLinkText('partialLinkText')).replaceText('text');
        await e.web.element(e.by.tag('tag')).replaceText('text');
      });

      it('clearText', async () => {
        await e.web.element(e.by.htmlId('id')).clearText();
        await e.web.element(e.by.className('className')).clearText();
        await e.web.element(e.by.cssSelector('cssSelector')).clearText();
        await e.web.element(e.by.name('name')).clearText();
        await e.web.element(e.by.xpath('xpath')).clearText();
        await e.web.element(e.by.linkText('linkText')).clearText();
        await e.web.element(e.by.partialLinkText('partialLinkText')).clearText();
        await e.web.element(e.by.tag('tag')).clearText();
      });

      it('scrollToView', async () => {
        await e.web.element(e.by.htmlId('id')).scrollToView();
        await e.web.element(e.by.className('className')).scrollToView();
        await e.web.element(e.by.cssSelector('cssSelector')).scrollToView();
        await e.web.element(e.by.name('name')).scrollToView();
        await e.web.element(e.by.xpath('xpath')).scrollToView();
        await e.web.element(e.by.linkText('linkText')).scrollToView();
        await e.web.element(e.by.partialLinkText('partialLinkText')).scrollToView();
        await e.web.element(e.by.tag('tag')).scrollToView();
      });

      it('getText', async () => {
        await e.web.element(e.by.htmlId('id')).getText();
        await e.web.element(e.by.className('className')).getText();
        await e.web.element(e.by.cssSelector('cssSelector')).getText();
        await e.web.element(e.by.name('name')).getText();
        await e.web.element(e.by.xpath('xpath')).getText();
        await e.web.element(e.by.linkText('linkText')).getText();
        await e.web.element(e.by.partialLinkText('partialLinkText')).getText();
        await e.web.element(e.by.tag('tag')).getText();
      });

      it('focus', async () => {
        await e.web.element(e.by.htmlId('id')).focus();
        await e.web.element(e.by.className('className')).focus();
        await e.web.element(e.by.cssSelector('cssSelector')).focus();
        await e.web.element(e.by.name('name')).focus();
        await e.web.element(e.by.xpath('xpath')).focus();
        await e.web.element(e.by.linkText('linkText')).focus();
        await e.web.element(e.by.partialLinkText('partialLinkText')).focus();
        await e.web.element(e.by.tag('tag')).focus();
      });

      it('selectAllText', async () => {
        await e.web.element(e.by.htmlId('id')).selectAllText();
        await e.web.element(e.by.className('className')).selectAllText();
        await e.web.element(e.by.cssSelector('cssSelector')).selectAllText();
        await e.web.element(e.by.name('name')).selectAllText();
        await e.web.element(e.by.xpath('xpath')).selectAllText();
        await e.web.element(e.by.linkText('linkText')).selectAllText();
        await e.web.element(e.by.partialLinkText('partialLinkText')).selectAllText();
        await e.web.element(e.by.tag('tag')).selectAllText();
      });

      it('moveCursorToEnd', async () => {
        await e.web.element(e.by.htmlId('id')).moveCursorToEnd();
        await e.web.element(e.by.className('className')).moveCursorToEnd();
        await e.web.element(e.by.cssSelector('cssSelector')).moveCursorToEnd();
        await e.web.element(e.by.name('name')).moveCursorToEnd();
        await e.web.element(e.by.xpath('xpath')).moveCursorToEnd();
        await e.web.element(e.by.linkText('linkText')).moveCursorToEnd();
        await e.web.element(e.by.partialLinkText('partialLinkText')).moveCursorToEnd();
        await e.web.element(e.by.tag('tag')).moveCursorToEnd();
      });

      it('runScript', async () => {
        const script = 'function foo(el) {}';
        await e.web.element(e.by.htmlId('id')).runScript(script);
        await e.web.element(e.by.className('className')).runScript(script);
        await e.web.element(e.by.cssSelector('cssSelector')).runScript(script);
        await e.web.element(e.by.name('name')).runScript(script);
        await e.web.element(e.by.xpath('xpath')).runScript(script);
        await e.web.element(e.by.linkText('linkText')).runScript(script);
        await e.web.element(e.by.partialLinkText('partialLinkText')).runScript(script);
        await e.web.element(e.by.tag('tag')).runScript(script);
      });

      it('runScriptWithArgs', async () => {
        const script = 'function bar(a,b) {}';
        const argsArr = ['fooA','barB'];
        await e.web.element(e.by.htmlId('id')).runScriptWithArgs(script, argsArr);
        await e.web.element(e.by.className('className')).runScriptWithArgs(script, argsArr);
        await e.web.element(e.by.cssSelector('cssSelector')).runScriptWithArgs(script, argsArr);
        await e.web.element(e.by.name('name')).runScriptWithArgs(script, argsArr);
        await e.web.element(e.by.xpath('xpath')).runScriptWithArgs(script, argsArr);
        await e.web.element(e.by.linkText('linkText')).runScriptWithArgs(script, argsArr);
        await e.web.element(e.by.partialLinkText('partialLinkText')).runScriptWithArgs(script, argsArr);
        await e.web.element(e.by.tag('tag')).runScriptWithArgs(script, argsArr);
      });

      it('getCurrentUrl', async () => {
        await e.web.element(e.by.htmlId('id')).getCurrentUrl();
        await e.web.element(e.by.className('className')).getCurrentUrl();
        await e.web.element(e.by.cssSelector('cssSelector')).getCurrentUrl();
        await e.web.element(e.by.name('name')).getCurrentUrl();
        await e.web.element(e.by.xpath('xpath')).getCurrentUrl();
        await e.web.element(e.by.linkText('linkText')).getCurrentUrl();
        await e.web.element(e.by.partialLinkText('partialLinkText')).getCurrentUrl();
        await e.web.element(e.by.tag('tag')).getCurrentUrl();
      });

      it('getTitle', async () => {
        await e.web.element(e.by.htmlId('id')).getTitle();
        await e.web.element(e.by.className('className')).getTitle();
        await e.web.element(e.by.cssSelector('cssSelector')).getTitle();
        await e.web.element(e.by.name('name')).getTitle();
        await e.web.element(e.by.xpath('xpath')).getTitle();
        await e.web.element(e.by.linkText('linkText')).getTitle();
        await e.web.element(e.by.partialLinkText('partialLinkText')).getTitle();
        await e.web.element(e.by.tag('tag')).getTitle();
      });

      it('should allow for access to by via element', async () => {
        const webview = await e.web;
        await webview.element(e.by.htmlId('id')).tap();
      });
    })

    describe('Web Matchers',() => {
      it('by.htmlId', async () => {
        await e.expect(e.web.element(e.by.htmlId('id'))).toExist();
        await e.expect(e.web.element(e.by.htmlId('id'))).not.toExist();
        await e.expect(e.web.element(e.by.htmlId('id'))).toHaveText('text');
        await e.expect(e.web.element(e.by.htmlId('id'))).not.toHaveText('text');
      });

      it('by.className', async () => {
        await e.expect(e.web.element(e.by.className('className'))).toExist();
        await e.expect(e.web.element(e.by.className('className'))).not.toExist();
        await e.expect(e.web.element(e.by.className('className'))).toHaveText('text');
        await e.expect(e.web.element(e.by.className('className'))).not.toHaveText('text');
      });

      it('by.cssSelector', async () => {
        await e.expect(e.web.element(e.by.cssSelector('cssSelector'))).toExist();
        await e.expect(e.web.element(e.by.cssSelector('cssSelector'))).not.toExist();
        await e.expect(e.web.element(e.by.cssSelector('cssSelector'))).toHaveText('text');
        await e.expect(e.web.element(e.by.cssSelector('cssSelector'))).not.toHaveText('text');
      });

      it('by.name', async () => {
        await e.expect(e.web.element(e.by.name('name'))).toExist();
        await e.expect(e.web.element(e.by.name('name'))).not.toExist();
        await e.expect(e.web.element(e.by.name('name'))).toHaveText('text');
        await e.expect(e.web.element(e.by.name('name'))).not.toHaveText('text');
      });

      it('by.xpath', async () => {
        await e.expect(e.web.element(e.by.xpath('xpath'))).toExist();
        await e.expect(e.web.element(e.by.xpath('xpath'))).not.toExist();
        await e.expect(e.web.element(e.by.xpath('xpath'))).toHaveText('text');
        await e.expect(e.web.element(e.by.xpath('xpath'))).not.toHaveText('text');
      });

      it('by.linkText', async () => {
        await e.expect(e.web.element(e.by.linkText('link'))).toExist();
        await e.expect(e.web.element(e.by.linkText('link'))).not.toExist();
        await e.expect(e.web.element(e.by.linkText('link'))).toHaveText('text');
        await e.expect(e.web.element(e.by.linkText('link'))).not.toHaveText('text');
      });

      it('by.partialLinkText', async () => {
        await e.expect(e.web.element(e.by.partialLinkText('lin'))).toExist();
        await e.expect(e.web.element(e.by.partialLinkText('lin'))).not.toExist();
        await e.expect(e.web.element(e.by.partialLinkText('lin'))).toHaveText('text');
        await e.expect(e.web.element(e.by.partialLinkText('lin'))).not.toHaveText('text');
      });

      it('by.tag', async () => {
        await e.expect(e.web.element(e.by.tag('tag'))).toExist();
        await e.expect(e.web.element(e.by.tag('tag'))).not.toExist();
        await e.expect(e.web.element(e.by.tag('tag'))).toHaveText('text');
        await e.expect(e.web.element(e.by.tag('tag'))).not.toHaveText('text');
      });

      it('should allow for access to except via element', async () => {
        const webview = e.web();
        await e.expect(webview.element(e.by.htmlId('id'))).toExist();
      });
    });
  });
});

async function expectToThrow(func) {
  try {
    await func();
  } catch (ex) {
    expect(ex).toBeDefined();
  }
}

class MockExecutor {
  constructor() {
    this.executeResult = undefined;
  }

  async execute(invocation) {
    if (typeof invocation === 'function') {
      invocation = invocation();
    }
    expect(invocation.target).toBeDefined();
    expect(invocation.target.type).toBeDefined();
    expect(invocation.target.value).toBeDefined();

    this.recurse(invocation);
    await this.timeout(1);
    return this.executeResult ? {
      result: this.executeResult,
    } : undefined;
  }

  recurse(invocation) {
    for (const key in invocation) {
      if (invocation.hasOwnProperty(key)) {
        if (invocation[key] instanceof Object) {
          this.recurse(invocation[key]);
        }
        if (key === 'target' && invocation[key].type === 'Invocation') {
          const innerValue = invocation.target.value;
          expect(innerValue.target.type).toBeDefined();
          expect(innerValue.target.value).toBeDefined();
        }
      }
    }
  }

  async timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
