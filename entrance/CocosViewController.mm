//
//  CocosViewController.m
//  test4
//
//  Created by oregami on 16/11/28.
//  Copyright © 2016年 oregami. All rights reserved.
//


#import "CocosViewController.h"
#import "CocosAppDelegate.h"

#import "cocos2d.h"
#import "platform/ios/CCEAGLView-ios.h"


USING_NS_CC;

static CocosAppDelegate s_sharedApplication;
@interface CocosViewController ()

@end

@implementation CocosViewController


- (void)viewDidLoad {
    
    NSLog(@"[类 方法]：%s",__func__);

    [super viewDidLoad];
    
    //添加一个button
    UIButton *closeButton = [UIButton buttonWithType:UIButtonTypeRoundedRect];
    closeButton.frame = CGRectMake(0, 600, 100, 50);
    closeButton.tag = 1002;
    [closeButton setTitle:@"关闭" forState:UIControlStateNormal];
    [closeButton addTarget:self action:@selector(buttonPressed:) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:closeButton];
    
    [self addGLView]; //添加cocos2dx视图
    
}

-(void)buttonPressed:(id)sender
{
    NSLog(@"cocos：%s","xxxxxxx");

    CCDirector::sharedDirector()->end();
    [self.navigationController popViewControllerAnimated:YES];
}


-(void)addGLView
{
    UIWindow *window = [UIApplication sharedApplication].keyWindow;
    CCEAGLView *eaglView = [CCEAGLView viewWithFrame: CGRectMake(0, 0, 400, 500)                                                                     pixelFormat: kEAGLColorFormatRGBA8 //allow you to set the alpha value
                                                                     depthFormat: 0
                                                              preserveBackbuffer: NO
                                                                      sharegroup: nil
                                                                   multiSampling: NO
                                                                 numberOfSamples: 0 ];
    [self.view addSubview:eaglView];
    
    cocos2d::GLView *glview = cocos2d::GLViewImpl::createWithEAGLView((__bridge void *)eaglView);
    cocos2d::Director::getInstance()->setOpenGLView(glview);
    cocos2d::Application::getInstance()->setScriptSource("scence0.js");
    
    cocos2d::Application::getInstance()->run();
//    cocos2d::CCApplication::sharedApplication()->run(); //这个时候就run
}



// Override to allow orientations other than the default portrait orientation.
// This method is deprecated on ios6
- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation {
    return UIInterfaceOrientationIsPortrait( interfaceOrientation );
}

// For ios6, use supportedInterfaceOrientations & shouldAutorotate instead
- (NSUInteger) supportedInterfaceOrientations{
#ifdef __IPHONE_6_0
    return UIInterfaceOrientationMaskPortrait;
#endif
}

- (BOOL) shouldAutorotate {
    return YES;
}
@end
