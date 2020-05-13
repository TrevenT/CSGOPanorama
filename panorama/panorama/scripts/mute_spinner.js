var MuteSpinner = (function () {

	var m_curVal;
	var m_isMuted;

	function _ToggleMute ()
	{
		if ( 'xuid' in $.GetContextPanel().GetParent() )
		{
			var xuid = $.GetContextPanel().GetParent().xuid;

			GameStateAPI.ToggleMute( xuid );
	
			_UpdateVolumeDisplay();			

		}
	}

	function _GetCurrentValues ()
	{
		if ( 'xuid' in $.GetContextPanel().GetParent() )
		{
			var xuid = $.GetContextPanel().GetParent().xuid;

			m_curVal = GameStateAPI.GetPlayerVoiceVolume( xuid );
			m_curVal = m_curVal.toFixed( 1 );

			m_isMuted = GameStateAPI.IsSelectedPlayerMuted( xuid );

		}
	}

	function _OnValueChanged ( panel, newval )
	{
		if ( 'xuid' in $.GetContextPanel().GetParent() )
		{
			var xuid = $.GetContextPanel().GetParent().xuid;

			newval = newval.toFixed( 1 );

			_GetCurrentValues();

			if ( m_curVal != newval )
			{
				GameStateAPI.SetPlayerVoiceVolume( xuid, Number( newval ) );
				_UpdateVolumeDisplay();
			}
		}
	}

	function _UpdateVolumeDisplay ()
	{
		_GetCurrentValues();

		$.GetContextPanel().SetDialogVariable( 'value', m_curVal );

		var elSpinner = $.GetContextPanel().FindChildTraverse( 'id-mute-spinner' );

		var elSpinnerLabel = $.GetContextPanel().FindChildTraverse( 'id-mute-value' );
		if ( !elSpinnerLabel || !elSpinnerLabel.IsValid() )
			return;
		
		var elMutedImage = $.GetContextPanel().FindChildTraverse( 'id-mute-muted-img' );
		if ( !elMutedImage || !elMutedImage.IsValid() )
			return;

		if ( m_isMuted )
		{
			elMutedImage.RemoveClass( "hidden" );
			elSpinnerLabel.AddClass( "hidden" );
			elSpinner.spinlock = true;
			elSpinner.AddClass( 'muted' );

		}
		else
		{
			elMutedImage.AddClass( "hidden" );
			elSpinnerLabel.RemoveClass( "hidden" );
			elSpinner.spinlock = false;
			elSpinner.RemoveClass( 'muted' );
	
		}
	}


	return {
		ToggleMute: _ToggleMute,
		OnValueChanged: _OnValueChanged,
		UpdateVolumeDisplay: _UpdateVolumeDisplay,
	}
})();


                                                                                                    
                                           
                                                                                                    
(function () {

	$.RegisterEventHandler( "SpinnerValueChanged", $.GetContextPanel(), MuteSpinner.OnValueChanged );
})();