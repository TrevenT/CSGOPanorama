'use strict';

var PopupNews = ( function()
{
	var _Init = function()
	{
		var date = $.GetContextPanel().GetAttributeString( "date", '' );
		date = date.split( ' ' )[ 0 ];
		$.GetContextPanel().SetDialogVariable( 'news_date', date );

		var title = $.GetContextPanel().GetAttributeString( "title", '' );
		$.GetContextPanel().SetDialogVariable( 'news_title', title );

		var link = $.GetContextPanel().GetAttributeString( "link", '' );

		var elBlogHTML = $.GetContextPanel().FindChildTraverse( 'BlogHTML' );
		if ( elBlogHTML )
		{
			var link = $.GetContextPanel().GetAttributeString( "link", '' );

	  		                                                                       
	  		                                    
			elBlogHTML.SetURL( link );
		}

		function _OpenUrl ()
		{
			SteamOverlayAPI.OpenUrlInOverlayOrExternalBrowser( link );
			$.DispatchEvent( 'UIPopupButtonClicked', '' );
			$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.mainmenu_press_home', 'MOUSE' );
		}

		var elUrlBtn = $.GetContextPanel().FindChildTraverse( 'id-news-url-button' );
		if ( elUrlBtn )
		{
			elUrlBtn.SetPanelEvent( 'onactivate', _OpenUrl );
		}
	};

	var _Close = function()
	{
		var setVersionTo = $.GetContextPanel().GetAttributeString( "uisettingversion", '0' );

		GameInterfaceAPI.SetSettingString( 'ui_popup_weaponupdate_version', setVersionTo );
		$.DispatchEvent( 'UIPopupButtonClicked', '' );
	};

	function _HTMLFinishRequest ()
	{
		$.Schedule( 0.3, function()
		{
			var elHTML = $.GetContextPanel().FindChildTraverse( 'BlogHTML' );
			if ( elHTML )
			{
				elHTML.AddClass( 'visible' );
			}
		} );

	}

	function _HTMLOpenPopupTab ( objHtmlEventTarget, objHtml, sUrl )
	{
		SteamOverlayAPI.OpenUrlInOverlayOrExternalBrowser( sUrl );
		$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.mainmenu_press_home', 'MOUSE' );
	}

	return {
		Init: 					_Init,
		HTMLFinishRequest: 		_HTMLFinishRequest,
		HTMLOpenPopupTab:		_HTMLOpenPopupTab,
		Close: 					_Close
	};

})();

(function()
{
	$.RegisterEventHandler( "HTMLFinishRequest", $.GetContextPanel(), PopupNews.HTMLFinishRequest );
	$.RegisterEventHandler( "HTMLOpenPopupTab", $.GetContextPanel(), PopupNews.HTMLOpenPopupTab );
})();
