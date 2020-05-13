'use strict';

var PopupPrimeStatus = ( function ()
{
	var m_bIsPerfectWorld = MyPersonaAPI.GetLauncherType() === "perfectworld" ? true : false;
	var m_btnActivate = $( '#ActivateButton' );
	var m_btnPurchase = $( '#PurchaseButton' );
	var m_btnClose = $( '#CloseButton' );
	var m_btnCheckStatus = $( '#CheckStatusButton' );
	var m_elLoadingProgress = $( '#LoadingProgress' );
	var m_jsLoadingHandle = false;
	var m_bPrimeUpgradeAvailable = false;

	var _Init = function ()
	{
		_SetElevatedInfoText();
		_SetStatusPanel( MyPersonaAPI.GetElevatedState() );
	}

	function _SetElevatedInfoText()
	{
		var PrimeStatusDesc = $( '#PrimeStatusDesc' );
		PrimeStatusDesc.text = $.Localize( m_bIsPerfectWorld ? '#SFUI_Elevated_Status_Desc_pw_1' : '#SFUI_Elevated_Status_Desc_1' );

		var PrimeStatusFaq = $( '#PrimeStatusFaq' );
		PrimeStatusFaq.text = $.Localize( m_bIsPerfectWorld ? '#SFUI_Elevated_Status_Faq_pw_1' : '#SFUI_Elevated_Status_Faq_1' );
	}

	function _SetStatusPanel( strState )
	{
		m_bPrimeUpgradeAvailable = MyPersonaAPI.HasPrestige() || FriendsListAPI.GetFriendLevel( MyPersonaAPI.GetXuid() ) > 20;
		                           
		                                
		m_btnActivate.visible = false;                                                                                
		                                                                                                                                                                                            
		m_btnCheckStatus.visible = false;                                                                                                                                  
		m_btnPurchase.visible = strState !== "elevated" && !m_bIsPerfectWorld ? true : false;
		
		                                                                             
		                                                                                       
		                                                            
		    
		   	                 
		    
		       
		    
		   	                                                                   
		    

		m_elLoadingProgress.visible = false;
		var bButtonPanelVisible = m_btnActivate.visible || m_btnClose.visible || m_btnCheckStatus.visible || m_elLoadingProgress.visible || m_btnPurchase.visible;
		$( '#ButtonPanel' ).SetHasClass( "hidden", !bButtonPanelVisible );

		                                                                                                

		                                                 
		switch ( strState ) 
		{
			                   
			   	              
			   	                    
			   	      
			                       
			   	                    
			   	                  
			   	      
			case "elevated" :
				                                                                                                                                               
				_SetElevatedStatus();
				break;
			                    
			   	                                                   
			   	                     
			   	      
			                                  
			   	                                                                                        
			   	                                                                                                 
			   	                                                                                                             
			   	                                                                                                                                                                     
			   	                                                                                                                                                   
			   	                          
			   	      
			case "none" :
				                                                                                                                         
				_SetFailedStatusNone();
				break;
			                           
			   	                                                                                                         
			   	                        
			   	      
			                             
			   	                                                                                                                                       
			   	                                                                                                                                                          
			   	                                                                           
			   	                                                                                    
			   	      
			                            
			   	                                 
			   	                                                                                      
			   	      
			                   
			   	                   
			   	                                                                                                         
			   	      
			default:
				                    
				_SetFailedStatusNone();
				break;
		}
	}

	function _SetLoadingStatus()
	{	
		$( '#LoadingText' ).text = $.Localize( "#SFUI_Elevated_Status_Loading" );

		m_jsLoadingHandle = $.Schedule( 5.0, function ()
		{
			                                                                               
			                                                            
			m_jsLoadingHandle = false;		
			_SetStatusPanel( "timeout" );
		} );
	}

	function _CancelLoading()
	{
		if( m_elLoadingProgress.visible )
		{
			                  
			if ( m_jsLoadingHandle !==  false )
			{
				$.CancelScheduled( m_jsLoadingHandle );
				m_jsLoadingHandle = false;
			}

			m_elLoadingProgress.visible = false;
		}
	}

	function _UpdateStatus( strIconName, strText, strColorClass )
	{
		var elPrimeStatus = $( '#PrimeStatus' );

		if ( !strText )
		{
			elPrimeStatus.visible = false;
			return;
		}
		else
		{
			elPrimeStatus.visible = true;
		}

		elPrimeStatus.SetHasClass( "warning_status", strColorClass === "warning_status" );
		elPrimeStatus.SetHasClass( "ok_status", strColorClass === "ok_status" );
		$( '#PrimeStatusImage' ).SetImage( _GetIconPath( strIconName ) );

		var elTextPanel = $( '#PrimeStatusText' );
		var strLocalized = $.Localize( strText, elTextPanel );
		elTextPanel.text = strLocalized;
	}

	function _UpdateActivateButton( strText, func )
	{
		var elActivateButtonText = $( '#ActivateButtonText' );
		elActivateButtonText.text = $.Localize( strText );
		elActivateButtonText.SetPanelEvent( 'onactivate', func );
	}

	function _UpdateCheckStatusButton( strIconName, strText, func )
	{
		$( '#CheckStatusButtonImage' ).SetImage( _GetIconPath( strIconName ) );
		$( '#CheckStatusButtonText' ).text = $.Localize( strText );
		m_btnCheckStatus.SetPanelEvent( 'onactivate', func );
	}

	function _GetIconPath( strIconName )
	{
		return "file://{images}/icons/ui/" + strIconName + ".svg";
	}

	function _SetCheckStatus()
	{
		_UpdateCheckStatusButton( "refresh", "#SFUI_Elevated_Status_Check_Btn", function()
		{
			_SetStatusPanel( "loading" );
		} );
	
		_UpdateStatus( "info", "#SFUI_Elevated_Status_Commit", null );
	}

	function _SetEligibleStatus()
	{
		_UpdateActivateButton( "#SFUI_Elevated_Status_Confirm_Btn", function()
		{
			MyPersonaAPI.ActionElevate( false );
			_SetStatusPanel( "loading" );
		} );

		_UpdateStatus( "info", "#SFUI_Elevated_Status_Eligable", null );
	}

	function _SetStatusPanelTakeover()
	{
		_UpdateActivateButton( "#SFUI_Elevated_Status_Switch_Btn", function() { _ShowWarningPanel(); } );

		_UpdateStatus( "warning", "#SFUI_Elevated_Status_Different", "warning_status" );
	}

	function _SetFailedStatus()
	{
		_UpdateStatus( "info", "#SFUI_Elevated_Status_Error", "warning_status" );
	}

	function _SetFailedStatusNone ()
	{
		if ( m_bPrimeUpgradeAvailable || m_bIsPerfectWorld )
		{
			var strStatusText = m_bIsPerfectWorld ? "#SFUI_Elevated_Status_NoPhone_pw" : "";
			_UpdateStatus( "info", strStatusText, "warning_status" );

			var strCheckStatusText = m_bIsPerfectWorld ? "#SFUI_Elevated_Status_Add_Btn_pw" : "#SFUI_Elevated_Status_Add_Btn";
			_UpdateCheckStatusButton( "external_link", strCheckStatusText, function()
			{
				SteamOverlayAPI.OpenURL( _GetSteamUrl( m_bIsPerfectWorld ) );
			} );
		}
		else
		{
			var strStatusText = "";
			_UpdateStatus( "info", strStatusText, "warning_status" );
		}

		               
		m_btnPurchase.SetPanelEvent( 'onactivate', function() { SteamOverlayAPI.OpenURL( 'https://store.steampowered.com/sub/54029' ); $.DispatchEvent( 'UIPopupButtonClicked', '' );} );
	}

	function _SetFailedStatusError()
	{
		_UpdateCheckStatusButton( "external_link", "#SFUI_Elevated_Status_Update_Btn", function()
		{
			SteamOverlayAPI.OpenURL( _GetSteamUrl( m_bIsPerfectWorld ) );
		} );
		
		var strStatusText = m_bIsPerfectWorld ? "#SFUI_Elevated_Status_Invalid_pw" : "#SFUI_Elevated_Status_Invalid";
		_UpdateStatus( "info", strStatusText, "warning_status" );
	}

	function _SetFailedStatusCooldown( strType, strWarningText )
	{
		var numSec = MyPersonaAPI.GetElevatedTime( strType );
		if ( numSec <= 0  )
		{
			_SetStatusPanel("timeout");
			return;
		}

		$( '#PrimeStatusText' ).SetDialogVariable( "cooldowntime", FormatText.SecondsToSignificantTimeString( numSec ) );
		_UpdateStatus( "info", strWarningText, true );
	}

	function _SetElevatedStatus()
	{
		_UpdateStatus( "check", "#SFUI_Elevated_Status_Verified", "ok_status" );
	}

	function _GetSteamUrl( m_bIsPerfectWorld )
	{
		if( m_bIsPerfectWorld )
			return "https://members.csgo.com.cn/steam/link";
		if( SteamOverlayAPI.GetAppID() == "710" )
			return "https://store.beta.steampowered.com/phone/add";
		else
			return "https://store.steampowered.com/phone/add";
	}

	function _ShowWarningPanel()
	{
		UiToolkitAPI.ShowGenericPopupTwoOptions( 'PrimeStatusWarning', "#SFUI_Elevated_Status_Warning", 'prime-status__warning',
			"#SFUI_Elevated_Status_Switch_Btn", function()
			{
				_SetStatusPanel( "loading" );
				MyPersonaAPI.ActionElevate( true );
				$.DispatchEvent( 'UIPopupButtonClicked', '' );
			},
			"#vgui_close", function()
			{
				$.DispatchEvent( 'UIPopupButtonClicked', '' );
			} );
	}

	function _UpdateEleveatedStatusPanel()
	{
		_SetStatusPanel( MyPersonaAPI.GetElevatedState() );
	}

	return {
		Init						: _Init,
		UpdateEleveatedStatusPanel	:_UpdateEleveatedStatusPanel
	}

})();

(function()
{
	$.RegisterForUnhandledEvent( "PanoramaComponent_MyPersona_ElevatedStateUpdate", PopupPrimeStatus.UpdateEleveatedStatusPanel );
})();
