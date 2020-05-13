'use strict';

var PopupAddFriend = ( function(){

	var m_xuidToInvite = '';

	var _Init = function() 
	{
		var yourCode = MyPersonaAPI.GetFriendCode();
		
		var onMouseOver = function()
		{
			UiToolkitAPI.ShowTextTooltip( 'JsPopupYourFriendCode', yourCode );
		}

		var onMouseOut = function()
		{
			UiToolkitAPI.HideTextTooltip();
		}
		
		var onActivate = function()
		{
			SteamOverlayAPI.CopyTextToClipboard( yourCode );
			UiToolkitAPI.ShowTextTooltip( 'JsPopupYourFriendCode', 'Copied your code to clipboard' );
		}

		var elYourCodeBtn = $( '#JsPopupYourFriendCode' );

		elYourCodeBtn.SetPanelEvent( 'onmouseover', onMouseOver );
		elYourCodeBtn.SetPanelEvent( 'onmouseout', onMouseOut );
		elYourCodeBtn.SetPanelEvent( 'onactivate', onActivate );

		                                         
		$( '#JsPopupYourSendRequest' ).enabled = false;

		                                                
		$( '#JsFriendCodeNotFound' ).visible = false;
		$( '#JsFriendCodeFound' ).visible = false;

		_SetUpEnterTextButton();
	};

	var _SetUpEnterTextButton = function()
	{
		var elBtn = $.GetContextPanel().FindChildTraverse( 'JsEnterNameBtn' );
		elBtn.SetPanelEvent( 'onactivate', _OnEntrySubmit );
	};

	var _OnEntrySubmit = function ()
	{
		var elNotFoundLabel = $( '#JsFriendCodeNotFound' ),
		elTextEntry = $( '#JsAddFriendTextEntryLabel' );

		var xuid = FriendsListAPI.GetXuidFromFriendCode( elTextEntry.text.toUpperCase() );
		
		if( xuid )
		{
			              
			var elTile = $.GetContextPanel().FindChildTraverse( 'JsPopupFriendTile' );

			if( !elTile )
			{
				elTile = $.CreatePanel( "Panel", $( '#JsFriendCodeFound' ), 'JsPopupFriendTile' );
				elTile.SetAttributeString( 'xuid', xuid );
				elTile.BLoadLayout('file://{resources}/layout/friendtile.xml', false, false);
			}
			
			                                                               
			$.Schedule( .1, function () { 
				friendTile.Init( elTile ); 
				elTile.RemoveClass( 'hidden' );
				                                     
				                                        
			});

			$( '#JsAddFriendInviteImg' ).AddClass('hidden');
			$( '#JsFriendCodeFound' ).visible = true;
			$( '#JsPopupYourSendRequest' ).enabled = true;

			elNotFoundLabel.visible = false;

			m_xuidToInvite = xuid;
		}
		else
		{
			if( elTextEntry.text === '' )
			{
				elNotFoundLabel.visible = false;
				return;
			}
			
			                          
			elNotFoundLabel.SetDialogVariable( 'code', elTextEntry.text.toUpperCase() );
			elNotFoundLabel.text = $.Localize( '#AddFriend_not_found', elNotFoundLabel );
			
			elNotFoundLabel.visible = true;

			$( '#JsPopupYourSendRequest' ).enabled = false;
			$( '#JsFriendCodeFound' ).visible = false;
		}
	};

	var _OnSendInvite = function ()
	{
		$( '#JsAddFriendInviteImg' ).RemoveClass('hidden');
		$( '#JsPopupYourSendRequest' ).enabled = false;
		SteamOverlayAPI.InteractWithUser( m_xuidToInvite, 'friendadd' );
		$.DispatchEvent( 'UIPopupButtonClicked', '' );
	};

	var _OnCancelEntry = function ()
	{
		
	};


	return {
		Init			:	_Init,
		OnSendInvite	:	_OnSendInvite,
		OnCancelEntry	:	_OnCancelEntry,
		OnEntrySubmit	:	_OnEntrySubmit
	};

})();