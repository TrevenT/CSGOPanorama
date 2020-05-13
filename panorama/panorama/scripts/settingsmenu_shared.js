'use strict';


var SettingsMenuShared = ( function () {

	var _ResetControlsRecursive = function( panel )
	{
		if (panel.GetChildCount == undefined)
		{
			                                       
			return;
		}

		if (panel.paneltype == 'CSGOSettingsSlider' || panel.paneltype == 'CSGOSettingsEnumDropDown')
		{
			panel.RestoreCVarDefault();
		}
		else if ( panel.paneltype == 'CSGOSettingsKeyBinder' )
		{
			                                                                                          
			panel.OnShow();
		}
		else                                          
		{
			var nCount = panel.GetChildCount();
			for ( var i = 0; i < nCount; i++ )
			{
				var child = panel.GetChild(i);
				_ResetControlsRecursive(child);
			}
		}
	};

	var _ResetControls = function( )
	{
		                        
		_ResetControlsRecursive($.GetContextPanel());
	};

	var _ResetKeybdMouseDefaults = function( )
	{
		                                 
		OptionsMenuAPI.RestoreKeybdMouseBindingDefaults();
		_ResetControls();
	};

	var _ResetAudioSettings = function( )
	{
		$.DispatchEvent( "CSGOAudioSettingsResetDefault" );
		_ResetControls();
	};

	var _ResetVideoSettings = function( )
	{
		$.DispatchEvent( "CSGOVideoSettingsResetDefault" );
		_ResetControls();
		_VideoSettingsOnUserInputSubmit();
	};
	
	var _RefreshControlsRecursive = function( panel )
	{
		if ( panel.OnShow != undefined )
		{
			panel.OnShow();
		}
		
		if (panel.GetChildCount == undefined)
		{
			                                       
			return;
		}
		else                                          
		{
			var nCount = panel.GetChildCount();
			for ( var i = 0; i < nCount; i++ )
			{
				var child = panel.GetChild(i);
				_RefreshControlsRecursive(child);
			}
		}
	};

	var _ShowConfirmReset = function ( resetCall, locText )
	{
		UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle('#settings_reset_confirm_title',
			locText,
			'',
			'#settings_reset',
			function() {
				resetCall();
			},
			'Return',
			function() {
			},
			'dim'
		);
	}

	var _ShowConfirmDiscard = function ( discardCall )
	{
		UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle('#settings_discard_confirm_title',
			'#settings_discard_confirm_video_desc',
			'',
			'#settings_discard',
			function() {
				discardCall();
			},
			'Return',
			function() {
			},
			'dim'
		);
	}

	var _ScrollToId = function ( locationId )
	{
		var elLocationPanel = $.GetContextPanel().FindChildInLayoutFile( locationId );
		elLocationPanel.ScrollParentToMakePanelFit(2, false);
		elLocationPanel.AddClass('Highlight');

		var kfs = elLocationPanel.CreateCopyOfCSSKeyframes( 'settings-highlight' );
		elLocationPanel.UpdateCurrentAnimationKeyframes( kfs );
	}

	                                                                    
	                                           
	                                      
	                                       
	                                         

	var gVideoSettingsUserSubmittedInput = false;
	var gBtnApplyVideoSettingsButton=null;
	var gBtnDiscardVideoSettingChanges=null;
	
	var _VideoSettingsOnUserInputSubmit = function ()
	{
		gBtnApplyVideoSettingsButton.enabled = true;
		gBtnDiscardVideoSettingChanges.enabled = true;
		gVideoSettingsUserSubmittedInput = true;
	}

	var _VideoSettingsResetUserInput = function ()
	{
		gBtnApplyVideoSettingsButton.enabled = false;
		gBtnDiscardVideoSettingChanges.enabled = false;
		gVideoSettingsUserSubmittedInput = false;
	}

	var _VideoSettingsDiscardChanges = function ()
	{
		$.DispatchEvent( "CSGOVideoSettingsInit" );
		_VideoSettingsResetUserInput();
	}

	var _VideoSettingsApplyChanges = function ()
	{
		$.DispatchEvent( "CSGOApplyVideoSettings" );
		_VideoSettingsResetUserInput();
	}

	var _NewTabOpened = function ( prevTab, newTab )
	{
		                                            
		
		var videoSettingsStr = 'VideoSettings';

		if ( newTab == videoSettingsStr )
		{
			var videoSettingsPanel = $.GetContextPanel().FindChildInLayoutFile( videoSettingsStr );
			
			                                                                 
			gBtnApplyVideoSettingsButton = videoSettingsPanel.FindChildInLayoutFile( "BtnApplyVideoSettings" );
			gBtnDiscardVideoSettingChanges = videoSettingsPanel.FindChildInLayoutFile( "BtnDiscardVideoSettingChanges" );
			
			                                  
			gVideoSettingsUserSubmittedInput = false;
			gBtnApplyVideoSettingsButton.enabled = false;
			gBtnDiscardVideoSettingChanges.enabled = false;

			                                         
			$.DispatchEvent( "CSGOVideoSettingsInit" );
		}

		var newTabPanel = $.GetContextPanel().FindChildInLayoutFile( newTab );
		_RefreshControlsRecursive( newTabPanel );

		                                                                               
		GameInterfaceAPI.ConsoleCommand( "host_writeconfig");
	}

	var _ShowHudEdgePositions = function()
	{
		UiToolkitAPI.ShowCustomLayoutPopup('', 'file://{resources}/layout/popups/popup_hud_edge_positions.xml');
	}


	return {

		ResetControlsRecursivepanel	    : _ResetControlsRecursive,
		ResetControls	                : _ResetControls,
		ResetKeybdMouseDefaults	        : _ResetKeybdMouseDefaults,
		ResetAudioSettings	            : _ResetAudioSettings,
		ResetVideoSettings	            : _ResetVideoSettings,
		ScrollToId                      : _ScrollToId,
		ShowConfirmReset                : _ShowConfirmReset,
		ShowConfirmDiscard				: _ShowConfirmDiscard,
		VideoSettingsOnUserInputSubmit  : _VideoSettingsOnUserInputSubmit,
		VideoSettingsDiscardChanges		: _VideoSettingsDiscardChanges,
		VideoSettingsApplyChanges		: _VideoSettingsApplyChanges,
		NewTabOpened					: _NewTabOpened,
		ShowHudEdgePositions			: _ShowHudEdgePositions
	};

} )();