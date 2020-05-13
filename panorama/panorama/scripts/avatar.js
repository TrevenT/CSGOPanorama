'use strict';

var Avatar = ( function()
{
	
	var _Init = function( elAvatar, xuid, type )
	{
		                                      

		switch ( type )
		{
			case 'playercard':
				_SetImage( elAvatar, xuid );
				_SetFlair( elAvatar, xuid );
				_SetTeamColor( elAvatar, xuid );
				_SetLobbyLeader( elAvatar, xuid );
				break;
			default:
				_SetImage( elAvatar, xuid );
				_SetTeamColor( elAvatar, xuid );
		}
	};

	var _SetImage = function( elAvatar, xuid )
	{
		var elImage = elAvatar.FindChildTraverse( 'JsAvatarImage' );
		
		if ( xuid === '' || xuid === '0' || xuid === 0 )
		{
			elImage.AddClass( 'hidden' );
			return;
		}

		elImage.steamid = xuid;
		elImage.RemoveClass( 'hidden' );
	};

	var _SetFlair = function( elAvatar, xuid )
	{
		var elFlair = elAvatar.FindChildTraverse( 'JsAvatarFlair' );
	
		if ( xuid === '' || xuid === '0' || xuid === 0 )
		{
			elFlair.AddClass( 'hidden' );
			return;
		}

		elFlair.RemoveClass( 'hidden' );

		var flairId = InventoryAPI.GetFlairItemId( xuid );

		var isIdFromInventory = true;

		                                                                                   
		if ( flairId === "0" || !flairId )
		{
			isIdFromInventory = false;
			flairId = FriendsListAPI.GetFriendDisplayItemDefFeatured( xuid );
		}
		
		if ( flairId === "0" || !flairId )
			return;

		var imagePath = "";
		if ( isIdFromInventory )
			imagePath = InventoryAPI.GetItemInventoryImage( flairId );
		else
			imagePath = ItemDataAPI.GetItemInventoryImage( flairId );

		
		elFlair.SetImage( 'file://{images_econ}' + imagePath + '_small.png' );
	};

	var _SetTeamColor = function( elAvatar, xuid )
	{
		var teamColor = PartyListAPI.GetPartyMemberSetting( xuid, 'game/teamcolor' );
		var elTeamColor = elAvatar.FindChildTraverse( 'JsAvatarTeamColor' );

		if ( !teamColor )
		{
			if ( elTeamColor )
				elTeamColor.AddClass( 'hidden' );

			return;
		}

		if( TeamColor )
		{
			var rgbColor = TeamColor.GetTeamColor( Number( teamColor ) );
			
			elTeamColor.RemoveClass( 'hidden' );
			elTeamColor.style.washColor = 'rgb(' + rgbColor + ')';
		}
	};

	var _SetTeamLetter = function( elAvatar, xuid, nSlot )
	{
		var teamColor = PartyListAPI.GetPartyMemberSetting( xuid, 'game/teamcolor' );
		var elTeamLetter = elAvatar.FindChildTraverse( 'JsAvatarTeamLetter' );
		var useLetters = false;

		if ( teamColor == '' && useLetters )
		{
			if ( elTeamLetter )
				elTeamLetter.AddClass( 'hidden' );

			return;
		}

		var teamLetter = elTeamLetter._GetTeamColorLetter( Number( teamColor ) );
		elTeamLetter.RemoveClass( 'hidden' );
		elTeamLetter.text = teamLetter;

	};

	var _SetLobbyLeader = function( elAvatar, xuid )
	{
		var show = elAvatar.GetAttributeString( 'showleader', '' );
		var elLeader = elAvatar.FindChildTraverse( 'JsAvatarLeader' );
		
		if ( elLeader )
		{
			if ( show === 'show' )
				elLeader.RemoveClass( 'hidden' );
			else
				elLeader.AddClass( 'hidden' );
		}
	};

	return {
		Init: _Init
	};
})();

(function()
{
	                                                                           
	                                                                                                          
})();