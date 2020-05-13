'use strict';

var MainMenuVanityContextMenu = ( function()
{

	var team;

	function _Init ()
	{
		team = $.GetContextPanel().GetAttributeString( "team", "" );		

		var elContextMenuBodyNoScroll = $.GetContextPanel().FindChildTraverse( 'ContextMenuBodyNoScroll' );
		var elContextMenuBodyWeapons = $.GetContextPanel().FindChildTraverse( 'ContextMenuBodyWeapons' );

		elContextMenuBodyNoScroll.RemoveAndDeleteChildren();
		elContextMenuBodyWeapons.RemoveAndDeleteChildren();

		                                                                                                
		var strOtherTeamToPrecache;

		if ( team == 2 )
		{
			strOtherTeamToPrecache = 'ct';
			var elItem = $.CreatePanel( 'Button', elContextMenuBodyNoScroll, 'switchToCt' );
			elItem.BLoadLayoutSnippet( 'snippet-vanity-item' );
			var elLabel = elItem.FindChildTraverse( 'id-vanity-item__label' );
			elLabel.text = $.Localize( '#mainmenu_switch_vanity_to_ct' );
			elItem.SetPanelEvent( 'onactivate',function() 
			{
				$.DispatchEvent( "MainMenuSwitchVanity", 'ct' );
				$.DispatchEvent( 'ContextMenuEvent', '' );
			} );
			                                    
			elItem.SetFocus();
		}
		else
		{
			strOtherTeamToPrecache = 't';
			var elItem = $.CreatePanel( 'Button', elContextMenuBodyNoScroll, 'switchToT' );
			elItem.BLoadLayoutSnippet( 'snippet-vanity-item' );
			var elLabel = elItem.FindChildTraverse( 'id-vanity-item__label' );
			elLabel.text = $.Localize( '#mainmenu_switch_vanity_to_t' );
			elItem.SetPanelEvent( 'onactivate', function() 
			{
				$.DispatchEvent( "MainMenuSwitchVanity", 't' );
				$.DispatchEvent( 'ContextMenuEvent', '' );
			});
			                                    
			elItem.SetFocus();
		}

		var elItem = $.CreatePanel( 'Button', elContextMenuBodyNoScroll, 'GoToLoadout' );
		elItem.BLoadLayoutSnippet( 'snippet-vanity-item' );
		var elLabel = elItem.FindChildTraverse( 'id-vanity-item__label' );
		elLabel.text = $.Localize( '#mainmenu_go_to_character_loadout' );
		elItem.AddClass( 'BottomSeparator' );
		elItem.SetPanelEvent( 'onactivate', function( team )
		{
			$.DispatchEvent( "MainMenuGoToCharacterLoadout", team );
			$.DispatchEvent( 'ContextMenuEvent', '' );
		}.bind( undefined, team ) );


		var list = ItemInfo.GetLoadoutWeapons( team );

		if ( list && list.length > 0 )
		{

			list.forEach( function( entry )
			{
				var elItem = $.CreatePanel( 'Button', elContextMenuBodyWeapons, entry );
				elItem.BLoadLayoutSnippet( 'snippet-vanity-item' );
				elItem.AddClass( 'vanity-item--weapon' );
				var elLabel = elItem.FindChildTraverse( 'id-vanity-item__label' );
				elLabel.text = ItemInfo.GetName( entry );
				var elRarity = elItem.FindChildTraverse( 'id-vanity-item__rarity');
				var rarityColor = ItemInfo.GetRarityColor( entry );
		  		                                   
		  		                      
				elRarity.style.backgroundColor = "gradient( linear, 0% 0%, 100% 0%, from(" + rarityColor + " ),  color-stop( 0.0125, #00000000 ), to( #00000000 ) );" ;




				elItem.SetPanelEvent( 'onactivate', function( team )
				{
					var shortTeam = CharacterAnims.NormalizeTeamName( team, true );
					var loadoutSubSlot = ItemInfo.GetSlotSubPosition( entry );
					GameInterfaceAPI.SetSettingString( 'ui_vanitysetting_loadoutslot_' + shortTeam, loadoutSubSlot );

					$.DispatchEvent( 'ForceRestartVanity' );
					$.DispatchEvent( 'ContextMenuEvent', '' );

				}.bind( undefined, team ) );
			} )
		}

		  
		                                                 
		  
		var otherTeamCharacterItemID = LoadoutAPI.GetItemID( strOtherTeamToPrecache, 'customplayer' );
		var settingsForOtherTeam = ItemInfo.GetOrUpdateVanityCharacterSettings( otherTeamCharacterItemID );
		ItemInfo.PrecacheVanityCharacterSettings( settingsForOtherTeam );
	}

	return {
		Init: _Init,
	}


})();

(function()
{

})();