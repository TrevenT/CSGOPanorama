'use strict';

var freezePanel = ( function() {
	
	var _OnSetFlairEvent = function( xuid )
	{
		var elAvatarFlair = $( '#AvatarFlair' );
		var elMedalText = $( '#MedalText' );
		var elAvatarFlairSS = $( '#AvatarFlairSS' );
		var elMedalTextSS = $( '#MedalTextSS' );

		var flairItemImage = _GetFlairItemImage( xuid );
		if ( flairItemImage !== '' )
		{
			elAvatarFlair.RemoveClass( 'FreezePanel__AvatarFlair--Hidden' );
			elAvatarFlair.SetImage( 'file://{images_econ}' + flairItemImage + '_small.png' );
			elAvatarFlairSS.RemoveClass( 'FreezePanel__AvatarFlair--Hidden' );
			elAvatarFlairSS.SetImage( 'file://{images_econ}' + flairItemImage + '_small.png' );

			var flairItemName = InventoryAPI.GetFlairItemName( xuid );
			if ( flairItemName === '' || flairItemName === undefined )
			{
				elMedalText.AddClass( 'FreezePanel__MedalText--Hidden' );
				elMedalTextSS.AddClass( 'FreezePanel__MedalText--Hidden' );
			}
			else
			{
				elMedalText.RemoveClass( 'FreezePanel__MedalText--Hidden' );
				elMedalText.text = flairItemName;
				elMedalTextSS.RemoveClass( 'FreezePanel__MedalText--Hidden' );
				elMedalTextSS.text = flairItemName;
			}
		}
		else
		{
			elAvatarFlair.AddClass( 'FreezePanel__AvatarFlair--Hidden' );
			elMedalText.AddClass( 'FreezePanel__MedalText--Hidden' );
			elAvatarFlairSS.AddClass( 'FreezePanel__AvatarFlair--Hidden' );
			elMedalTextSS.AddClass( 'FreezePanel__MedalText--Hidden' );
		}
	}

	                                            
	                                          
	var _GetFlairItemImage = function( xuid )
	{
		if( xuid === '' || xuid === '0'|| xuid === 0 )
		{
			return '';
		}

		var flairId =  InventoryAPI.GetFlairItemId( xuid );
		var isIdFromInventory = true;

		                                                                                   
		if ( flairId === "0" || !flairId )
		{
			isIdFromInventory = false;
			flairId = FriendsListAPI.GetFriendDisplayItemDefFeatured( xuid );
		}

		if( flairId === "0" || !flairId )
		{
			return '';
		}

		var imagePath = '';
		if( isIdFromInventory )
		{
			imagePath = InventoryAPI.GetItemInventoryImage( flairId );
		}
		else
		{
			imagePath = ItemDataAPI.GetItemInventoryImage( flairId );
		}
		
		return imagePath;
	}

	return {
		OnSetFlairEvent : _OnSetFlairEvent
	};
} )();

(function()
{
	$.RegisterEventHandler( 'CSGOHudFreezePanelSetFlair', $.GetContextPanel(), freezePanel.OnSetFlairEvent );
})();