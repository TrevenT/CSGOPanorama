'use strict';

var PopupOperationLaunchMovie = ( function()
{
	var m_version = 0;
	var _Init = function()
	{
		
		var btns = $.GetContextPanel().FindChildInLayoutFile( 'id-operation-launch-buttons-row-buy-Btns' );
		$.DispatchEvent('PlayMainMenuMusic', false, true );
		
		$.Schedule( 6, function(){btns.AddClass('show')} );

		var elDoNotShow = $.GetContextPanel().FindChildInLayoutFile( 'id-operation-launch-btn-do-not-show' );
		elDoNotShow.SetPanelEvent( 'onactivate', _DoNotShowAgain );

		var elRepeat = $.GetContextPanel().FindChildInLayoutFile( 'id-operation-launch-btn-repeat' );
		elRepeat.SetPanelEvent( 'onactivate', _PlayAgain );
	};

	var _DoNotShowAgain = function()
	{
		if( m_version === $.GetContextPanel().GetAttributeString( "uisettingversion", '0' ) )
		{
			m_version = ( parseInt(m_version) - 1 ).toString();
			GameInterfaceAPI.SetSettingString( 'ui_popup_weaponupdate_version', m_version );
		}
		else
		{
			m_version = $.GetContextPanel().GetAttributeString( "uisettingversion", '0' )
			GameInterfaceAPI.SetSettingString( 'ui_popup_weaponupdate_version', m_version );
		}

		                                   
	};

	var _PlayAgain= function()
	{
		$("#VideoTrailerPlayer").Stop();
		$("#VideoTrailerPlayer").Play();
	}

	var _ClosePopup = function()
	{
		$.DispatchEvent( 'UIPopupButtonClicked', '' );
		$.DispatchEvent('PlayMainMenuMusic', true, true );
	}


	return {
		Init: _Init,
		ClosePopup: _ClosePopup
	};

})();

(function()
{
})();
