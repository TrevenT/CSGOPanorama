"use strict";

                                                                                                    
          
                                                                                                    

var activeTab;

function NavigateToTab( tab, btnPressed )
{
                 
                        
    if ( activeTab )
    {
        activeTab.RemoveClass( 'Active' );
    }

    activeTab = $( '#' + tab );

    if( activeTab )
    {
        activeTab.AddClass( 'Active' );
    }
    
}

function CloseControlsLib()
{
                                                                                                      
    $.GetContextPanel().DeleteAsync(.3);

    var controlsLibPanel = $.GetContextPanel();
    controlsLibPanel.RemoveClass( "Active" ); 
}

function OpenControlsLib()
{
    var controlsLibPanel = $.GetContextPanel();
    controlsLibPanel.AddClass( "Active");  
}

                                                                                                    
         
                                                                                                    
var jsPopupCallbackHandle;
var jsPopupLoadingBarCallbackHandle;
var popupLoadingBarLevel = 0;

function ClearPopupsText()
{
    $( '#ControlsLibPopupsText' ).text = '--';
}

function OnControlsLibPopupEvent( msg )
{
                                                                  
    $( '#ControlsLibPopupsText' ).text = msg;
}

function OnPopupCustomLayoutParamsPressed()
{
    ClearPopupsText();
    UiToolkitAPI.ShowCustomLayoutPopupParameters( '', 'file://{resources}/layout/popups/popup_custom_layout_test.xml', 'popupvalue=123456&callback=' + jsPopupCallbackHandle );
}

function OnPopupCustomLayoutImagePressed()
{
    ClearPopupsText();
    UiToolkitAPI.ShowCustomLayoutPopupParameters( '', 'file://{resources}/layout/popups/popup_custom_layout_test_image.xml', 'message=Example of popup with an image&image=file://{images}/control_icons/home_icon.vtf&callback=' + jsPopupCallbackHandle );
}

function OnPopupCustomLayoutImageSpinnerPressed()
{
    ClearPopupsText();
    UiToolkitAPI.ShowCustomLayoutPopupParameters( '', 'file://{resources}/layout/popups/popup_custom_layout_test_image.xml', 'message=Example of popup with an image and a spinner&image=file://{images}/control_icons/home_icon.vtf&spinner=1&callback=' + jsPopupCallbackHandle );
}

function OnPopupCustomLayoutImageLoadingPressed()
{
    ClearPopupsText();
    popupLoadingBarLevel = 0;
    UiToolkitAPI.ShowCustomLayoutPopupParameters( '', 'file://{resources}/layout/popups/popup_custom_layout_test_image.xml', 'message=Example of popup with an image and a loading bar&image=file://{images}/control_icons/home_icon.vtf&callback=' + jsPopupCallbackHandle + '&loadingBarCallback=' + jsPopupLoadingBarCallbackHandle );
}

function OnPopupCustomLayoutMatchAccept()
{
    ClearPopupsText();
    popupLoadingBarLevel = 0;
    UiToolkitAPI.ShowCustomLayoutPopupParameters( '', 'file://{resources}/layout/popups/popup_accept_match.xml', 'map_and_isreconnect=de_dust2,false');
}

function OnPopupCustomLayoutLoadingScreen()
{
    ClearPopupsText();
    UiToolkitAPI.ShowCustomLayoutPopup( 'teams', 'file://{resources}/layout/teamselectmenu.xml');
}

function OnControlsLibPopupLoadingBarEvent()
{
    popupLoadingBarLevel += 0.05;
    if ( popupLoadingBarLevel > 1.0 )
    {
        popupLoadingBarLevel = 1.0;
    }
    return popupLoadingBarLevel;
}


                                                                                                    
                
                                                                                                    

var jsContextMenuCallbackHandle;

function ClearContextMenuText()
{
    $( '#ControlsLibContextMenuText' ).text = '--';
}

function OnControlsLibContextMenuEvent( msg )
{
                                                                        
    $( '#ControlsLibContextMenuText' ).text = msg;
}

function OnSimpleContextMenu()
{
    ClearContextMenuText();
    
    var items = [];
    items.push( { label: 'Item 1', jsCallback: function() { OnControlsLibContextMenuEvent( 'Item1' ); } } );
    items.push( { label: 'Item 2', jsCallback: function() { OnControlsLibContextMenuEvent( 'Item2' ); } } );
    items.push( { label: 'Item 3', jsCallback: function() { OnControlsLibContextMenuEvent( 'Item3' ); } } );    

    UiToolkitAPI.ShowSimpleContextMenu( '', 'ControlLibSimpleContextMenu', items );
}

function OnContextMenuCustomLayoutParamsPressed()
{
    ClearContextMenuText();
    UiToolkitAPI.ShowCustomLayoutContextMenuParameters( '', '', 'file://{resources}/layout/context_menus/context_menu_custom_layout_test.xml', 'test=123456&callback=' + jsContextMenuCallbackHandle );
}


                                                                                                    
         
                                                                                                    

var g_VideoNumTrailers = 2;
var g_VideoCurrentTrailer = 0;

function VideoPlayNextTrailer()
{
    g_VideoCurrentTrailer = ( g_VideoCurrentTrailer + 1 ) % g_VideoNumTrailers;
    var videoPlayer = $( '#VideoTrailerPlayer' );
    videoPlayer.SetMovie( "file://{resources}/videos/trailer_" + g_VideoCurrentTrailer + ".webm" );
    videoPlayer.SetTitle( "Trailer " + g_VideoCurrentTrailer );
    videoPlayer.Play();
}


                                                                                                    
                   
                                                                                                    

var g_DialogVarCount = 0;

function UpdateParentDialogVariablesFromTextEntry( panelName )
{
    var varStr = $( "#ParentDialogVarTextEntry" ).text;

    $( "#DialogVarParentPanel" ).SetDialogVariable( 'testvar', varStr );
}

function UpdateChildDialogVariablesFromTextEntry( panelName )
{
    var varStr = $( "#ChildDialogVarTextEntry" ).text;

    $( "#DialogVarChildPanel" ).SetDialogVariable( 'testvar', varStr );
}

function InitDialogVariables()
{
    $( "#ControlsLibDiagVars" ).SetDialogVariableInt( "count", g_DialogVarCount );
    $( "#ControlsLibDiagVars" ).SetDialogVariable( "s1", "Test1" );
    $( "#ControlsLibDiagVars" ).SetDialogVariable( "s2", "Test2" );
    $( "#ControlsLibDiagVars" ).SetDialogVariable( "cam_key", "%jump%" );
    $( "#ControlsLibDiagVars" ).SetDialogVariable( "np_key", "%attack%" );
    $( "#ControlsLibDiagVars" ).SetDialogVariable( "sp_key", "%radio1%" );
	                                                                        

                                                
    $( "#DiagVarLabel" ).text = $.Localize( "\tDynamic Label Count: {d:r:count}", $( "#ControlsLibDiagVars" ) );

                                     
    $.Schedule( 1.0, UpdateDialogVariables );

    $( "#ParentDialogVarTextEntry" ).RaiseChangeEvents( true );
    $( "#ChildDialogVarTextEntry" ).RaiseChangeEvents( true );
    $.RegisterEventHandler( 'TextEntryChanged', $( "#ParentDialogVarTextEntry" ), UpdateParentDialogVariablesFromTextEntry );
    $.RegisterEventHandler( 'TextEntryChanged', $( "#ChildDialogVarTextEntry" ), UpdateChildDialogVariablesFromTextEntry );
}

function UpdateDialogVariables()
{
    g_DialogVarCount++;
    $( "#ControlsLibDiagVars" ).SetDialogVariableInt( "count", g_DialogVarCount );
                                                                            

    $.Schedule( 1.0, UpdateDialogVariables );
}


                                                                                                    
             
                                                                                                    

function OnImageFailLoad( panelName, image )
{
    var varStr = $( "#ChildDialogVarTextEntry" ).text;

                                                                                                              
                                                                                        
}

function InitPanels()
{
    var parent = $.FindChildInContext( "#ControlsLibPanelsDynParent" );

    $.CreatePanel( 'Label', parent, '', { text: 'Label, with text property, created dynamically from js.' } );
    $.CreatePanel( 'Label', parent, '', { class: 'fontSize-l fontWeight-Bold', style:'color:#558927;', text: 'Label, with text and class properties, created dynamically from js.' } );
    $.CreatePanel( 'TextButton', parent, '', { class: 'PopupButton', text:"Output to console", onactivate:"$.Msg('Panel tab - Button pressed !!!')" } );

    $.CreatePanel( 'ControlLibTestPanel', $.FindChildInContext( '#ControlsLibPanelsJS' ), '', { MyCustomProp:'Created dynamically from javascript', CreatedFromJS:1 } );

                     
    $.RegisterEventHandler( 'ImageFailedLoad', $( "#ControlsLibPanelImageFallback" ), OnImageFailLoad );
    $( "#ControlsLibPanelImageFallback" ).SetImage( "file://{images}/unknown2.vtf" );
}

                                                                                                    
                
                                                                                                    

function TransitionBlurPanel()
{
    $("#MyBlendBlurFitParent").RemoveClass("TheBlurAnimOut");
    $("#MyBlendBlurFitParent").RemoveClass("TheBlurAnimIn");
    $("#MyBlendBlurFitParent").AddClass("TheBlurAnimIn");
}

function TransitionBlurPanel2() {
    $("#MyBlendBlurFitParent").RemoveClass("TheBlurAnimIn");
    $("#MyBlendBlurFitParent").RemoveClass("TheBlurAnimOut");
    $("#MyBlendBlurFitParent").AddClass("TheBlurAnimOut");
}


function CreateSvgFromJs()
{
    $.CreatePanel('Image', $('#svgButton'), '', {
        src: "file://{images}/icons/ui/smile.svg",
        texturewidth: 100,
        textureheight: 100
    });
}



function GetRssFeed()
{
    BlogAPI.RequestRSSFeed();
}

function OnRssFeedReceived( feed )
{
                                                             


    var RSSFeedPanel = $( "#RSSFeed" );
    if ( RSSFeedPanel === undefined || RSSFeedPanel === null )
    {
        return;
    }

    RSSFeedPanel.RemoveAndDeleteChildren();

                             
    feed[ 'items' ].forEach( function( item ) {
        var itemPanel = $.CreatePanel( 'Panel', RSSFeedPanel, '', { acceptsinput: true, onactivate: 'SteamOverlayAPI.OpenURL( "' + item.link + '" );' } );
        itemPanel.AddClass( 'RSSFeed__Item' );

        $.CreatePanel( 'Label', itemPanel, '', { text: item.title, html: true, class: 'RSSFeed__ItemTitle' } );
        if ( item.imageUrl.length !== 0 )
        {
            $.CreatePanel( 'Image', itemPanel, '', { src: item.imageUrl, class: 'RSSFeed__ItemImage', scaling: 'stretch-to-fit-preserve-aspect' } );
        }
        $.CreatePanel( 'Label', itemPanel, '', { text: item.description, html: true, class: 'RSSFeed__ItemDesc' } );
        $.CreatePanel( 'Label', itemPanel, '', { text: item.date, html: true, class: 'RSSFeed__ItemDate' } );
    });
}

                                                                                                    
                                           
                                                                                                    
(function()
{
  
    OpenControlsLib();
    NavigateToTab('ControlLibStyleGuide');
   
    jsPopupCallbackHandle = UiToolkitAPI.RegisterJSCallback( OnControlsLibPopupEvent );
    jsContextMenuCallbackHandle = UiToolkitAPI.RegisterJSCallback( OnControlsLibContextMenuEvent );
    jsPopupLoadingBarCallbackHandle = UiToolkitAPI.RegisterJSCallback( OnControlsLibPopupLoadingBarEvent );

    $.RegisterForUnhandledEvent( "PanoramaComponent_Blog_RSSFeedReceived", OnRssFeedReceived );
})();