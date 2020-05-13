"use strict";

                                                                                                    
          
                                                                                                    

var SettingsMenu = ( function () {

    var activeTab;

    var _NavigateToTab = function( tab, XmlName ) {
                                      
                                        
    
        var parentPanel = $('#SettingsMenuContent');

                                               
                                    
        if (!parentPanel.FindChildInLayoutFile(tab))
        {
            var newPanel = $.CreatePanel('Panel', parentPanel, tab);
                                                             

            newPanel.BLoadLayout('file://{resources}/layout/settings/' + XmlName + '.xml', false, false );
            
                                                                                        
                                                                   
            newPanel.OnPropertyTransitionEndEvent = function ( panelName, propertyName )
            {   
                if( newPanel.id === panelName && propertyName === 'opacity')
                {
                                                             
                    if( newPanel.visible === true && newPanel.BIsTransparent() )
                    {
                                                                       
                        newPanel.visible = false;
                        newPanel.SetReadyForDisplay( false );
                        return true;
                    }
                }

                return false;
            }

            $.RegisterEventHandler( 'PropertyTransitionEnd', newPanel, newPanel.OnPropertyTransitionEndEvent );
        }

                                                                                  
                                
        if( activeTab !==  tab )
        {
                                             
            if( activeTab )
            {
                var panelToHide = $.GetContextPanel().FindChildInLayoutFile( activeTab );
                panelToHide.RemoveClass( 'Active' ); 
                                                   
            }
            
                               
            var prevTab = activeTab;
            activeTab = tab;
            var activePanel = $.GetContextPanel().FindChildInLayoutFile( tab );
            activePanel.AddClass( 'Active' );

                                          

                                                                                     
            activePanel.visible = true;
            activePanel.SetReadyForDisplay( true );
            SettingsMenuShared.NewTabOpened( prevTab, activeTab );
        }
    };

    var _AccountPrivacySettingsChanged = function()
    {
                                                                                        
                                                                                           
                                                                                           
        var gameSettingPanel = $.GetContextPanel().FindChildInLayoutFile ( "GameSettings" );
        if ( gameSettingPanel != null )
        {
            var twitchTvSetting = gameSettingPanel.FindChildInLayoutFile( "accountprivacydropdown" );
            if ( twitchTvSetting != null )
            {
                twitchTvSetting.OnShow();                
            }
        }
    }

    
	var _OnSettingsMenuHidden = function ()
	{
                                           
		GameInterfaceAPI.ConsoleCommand( "host_writeconfig");
	}

    return {

        NavigateToTab	                : _NavigateToTab,
        AccountPrivacySettingsChanged   : _AccountPrivacySettingsChanged,
        OnSettingsMenuHidden            : _OnSettingsMenuHidden
    };
    
} )() ;

                                                                                                    
                                           
                                                                                                    
(function ()
{
    SettingsMenu.NavigateToTab('KeybdMouseSettings', 'settings_kbmouse');

    MyPersonaAPI.RequestAccountPrivacySettings();
    $.RegisterForUnhandledEvent( "PanoramaComponent_MyPersona_AccountPrivacySettingsChanged", 
        SettingsMenu.AccountPrivacySettingsChanged );

    $.RegisterEventHandler( 'UnreadyForDisplay', $( '#JsSettings' ), SettingsMenu.OnSettingsMenuHidden );
})();

