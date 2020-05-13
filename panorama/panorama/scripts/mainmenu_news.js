'use strict';

var NewsPanel = (function () {

	var _GetRssFeed = function()
	{
		BlogAPI.RequestRSSFeed();
	}

	var _OnRssFeedReceived = function( feed )
	{
		                                          
		var elLister = $.GetContextPanel().FindChildInLayoutFile( 'NewsPanelLister' );

		if ( elLister === undefined || elLister === null || !feed )
			return;

		elLister.RemoveAndDeleteChildren();

		feed[ 'items' ].forEach( function( item, i )
		{
			var elEntry = $.CreatePanel( 'Panel', elLister, 'NewEntry' + i, {
				acceptsinput: true
			} );

			elEntry.BLoadLayoutSnippet( 'news-full-entry' );
			var elImage = elEntry.FindChildInLayoutFile( 'NewsHeaderImage' );
			if ( item.imageUrl )
			{
				elImage.SetImage( item.imageUrl );
			}
			else
			{
				elImage.SetImage( "file://{images}/store/default-news.png" );
			}

			var elEntryInfo = $.CreatePanel( 'Panel', elEntry, 'NewsInfo' + i );
			elEntryInfo.BLoadLayoutSnippet( 'news-info' );

			elEntryInfo.SetDialogVariable( 'news_item_date', item.date );
			elEntryInfo.SetDialogVariable( 'news_item_title', item.title );
			elEntryInfo.SetDialogVariable( 'news_item_body', item.description );

			         
			elEntry.FindChildInLayoutFile( 'NewsEntryBlurTarget' ).AddBlurPanel( elEntryInfo );

			elEntry.SetPanelEvent( "onactivate", SteamOverlayAPI.OpenURL.bind( SteamOverlayAPI, item.link ) );
		} );
	};

	return {
		GetRssFeed			: _GetRssFeed,
		OnRssFeedReceived: _OnRssFeedReceived,
	};
})();


(function () {
	NewsPanel.GetRssFeed();
	$.RegisterForUnhandledEvent( "PanoramaComponent_Blog_RSSFeedReceived", NewsPanel.OnRssFeedReceived );
})();