"use strict";
	

var DirectChallengeJoin = ( function ()
{
	var m_submitFn = null;

	function _Init()
	{
		$.GetContextPanel().SetDialogVariable( 'text', $.Localize( '#DirectChallenge_EnterKeyField' ) );

		m_submitFn = parseInt( $.GetContextPanel().GetAttributeInt( "submitCallback", -1 ) );

		$( "#submit" ).enabled = false;

		$( '#TextEntry' ).SetFocus();
	}

	function _Submit()
	{
		var value = $( '#TextEntry' ).text;

		UiToolkitAPI.InvokeJSCallback( m_submitFn, value );
		_Close();
	}

	function _AddGoToClanPageAction ( elAvatar, id )
	{
		elAvatar.SetPanelEvent( 'onactivate', function ()
		{
			SteamOverlayAPI.OpenUrlInOverlayOrExternalBrowser( "https://" + SteamOverlayAPI.GetSteamCommunityURL() + "/gid/" + id );
		} );
	}

	function _CreateClanTile ( elTile, xuid )
	{
		elTile.BLoadLayout( 'file://{resources}/layout/simple_player_tile.xml', false, false );

		                                                               
		$.Schedule( .1, function ( elTile, xuid )
		{
			if ( !elTile )
				return;

			elTile.FindChildTraverse( 'JsAvatarImage' ).steamid = xuid;

			var strName = MyPersonaAPI.GetMyClanNameById( xuid );
			elTile.SetDialogVariable( 'player_name', strName );

			_AddGoToClanPageAction( elTile, xuid );

			elTile.RemoveClass( 'hidden' );

		}.bind( this, elTile, xuid ) );
	}

	var _AddOpenPlayerCardAction = function ( elAvatar, xuid )
	{
		var openCard = function ( xuid )
		{
			                                                                                             
			$.DispatchEvent( 'SidebarContextMenuActive', true );

			if ( xuid !== 0 )
			{
				var contextMenuPanel = UiToolkitAPI.ShowCustomLayoutContextMenuParametersDismissEvent(
					'',
					'',
					'file://{resources}/layout/context_menus/context_menu_playercard.xml',
					'xuid=' + xuid,
					function ()
					{
						$.DispatchEvent( 'SidebarContextMenuActive', false )
					}
				);
				contextMenuPanel.AddClass( "ContextMenu_NoArrow" );
			}
		}

		elAvatar.SetPanelEvent( "onactivate", openCard.bind( undefined, xuid ) );
	};
	
	function _CreatePlayerTile ( elTile, xuid )
	{
		                                                                   

		elTile.BLoadLayout( 'file://{resources}/layout/simple_player_tile.xml', false, false );

		                                                               
		$.Schedule( .1, function ( elTile, xuid )
		{
			if ( !elTile || !elTile.IsValid() )
				return;

			elTile.FindChildTraverse( 'JsAvatarImage' ).steamid = xuid;

			var strName = FriendsListAPI.GetFriendName( xuid );
			elTile.SetDialogVariable( 'player_name', strName );

			_AddOpenPlayerCardAction( elTile, xuid );
			elTile.RemoveClass( 'hidden' );

		}.bind( this, elTile, xuid ) );
	}

	function _ClansInfoUpdated ()
	{
		var elTile = $.GetContextPanel().FindChildTraverse( 'JsKeyValidatedResult' );

		if ( elTile.codeType === 'g' && !elTile.FindChildTraverse( 'JsAvatarImage' ) )
		{
			_CreateClanTile( elTile, elTile.codeXuid );
		}
	}

	function _IsChallengeKeyValid ( key, oReturn = { value: [] }, how = '' )
	{
		var code = CompetitiveMatchAPI.ValidateDirectChallengeCode( key, how );

		var bValid = ( typeof code === 'string' ) && code.includes( ',' );

		if ( bValid )
		{
			oReturn.value = code.split( ',' );
		}

		return bValid;
	}

	function _Validate ()
	{
		var elResultsPanel = $( "#validation-result" );
		elResultsPanel.RemoveAndDeleteChildren();

		var bSuccess = false;

		var elText = $.CreatePanel( 'Label', elResultsPanel, 'created-by', { class: 'results-panel' } );
		var elAvatarContainer = $.CreatePanel( 'Panel', elResultsPanel, 'avatar-container', { class: 'avatar-container' } );

		var value = $( '#TextEntry' ).text;

		var oReturn = { value: [] };
		if ( _IsChallengeKeyValid( value.toUpperCase(), oReturn, '' ) )
		{
			                             

			var type = oReturn.value[ 2 ];                           
			var id = oReturn.value[ 3 ];                                 

			var elTile = $.CreatePanel( "Panel", elAvatarContainer, 'JsKeyValidatedResult', { class: "directchallenge__join-validator" } );
			elTile.codeXuid = id ;
			elTile.codeType = type ;

			switch ( type )
			{
				case 'u':
					elText.text = $.Localize( "#DirectChallenge_KeyGeneratedByUser" );
					_CreatePlayerTile( elTile, id );

					break;

				case 'g':
					elText.text = $.Localize( "#DirectChallenge_KeyGeneratedByClan" );

					if ( MyPersonaAPI.GetMyClanNameById( id ) )
					{
						_CreateClanTile( elTile, id );
					}

					break;
			}

			bSuccess = true;
		}
		else
		{
			                             
			elText.text = $.Localize( "#DirectChallenge_BadKeyText" );
			elText.style.color = 'red';

		}

		$( "#submit" ).enabled = bSuccess;
		$.GetContextPanel().SetHasClass( 'results-panel-valid', bSuccess );

	}

	function _Cancel ()
	{
		_Close();
	}

	function _Close ()
	{
		if ( m_submitFn != -1 )
			UiToolkitAPI.UnregisterJSCallback( m_submitFn );
		
		$.DispatchEvent( 'UIPopupButtonClicked', '' );
	}

	return {
		Init: 					_Init,
		Submit:					_Submit,
		Close: 					_Close,
		Cancel: 				_Cancel,
		Validate: 				_Validate,
		ClansInfoUpdated: 		_ClansInfoUpdated
	};

} )();

                                                                                                    
                                            
                                                                                                    
( function ()
{
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_ClansInfoUpdated', DirectChallengeJoin.ClansInfoUpdated );
} )();