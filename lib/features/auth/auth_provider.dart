import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

part 'auth_provider.g.dart';

class AuthState {
  final Session? session;
  final User? user;
  final bool isLoading;
  final bool isGuest;
  final bool isSessionExpired;

  AuthState({
    this.session,
    this.user,
    this.isLoading = true,
    this.isGuest = false,
    this.isSessionExpired = false,
  });

  AuthState copyWith({
    Session? session,
    User? user,
    bool? isLoading,
    bool? isGuest,
    bool? isSessionExpired,
  }) {
    return AuthState(
      session: session ?? this.session,
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      isGuest: isGuest ?? this.isGuest,
      isSessionExpired: isSessionExpired ?? this.isSessionExpired,
    );
  }
}

@riverpod
class AuthNotifier extends _$AuthNotifier {
  @override
  AuthState build() {
    _initialize();
    return AuthState();
  }

  Future<void> _initialize() async {
    final supabase = Supabase.instance.client;
    try {
      final session = supabase.auth.currentSession;
      
      bool isExpired = false;
      if (session != null && session.expiresAt != null) {
        final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
        isExpired = session.expiresAt! <= now;
      }

      state = AuthState(
        session: isExpired ? null : session,
        user: isExpired ? null : session?.user,
        isGuest: session == null || isExpired,
        isSessionExpired: isExpired,
        isLoading: false,
      );

      // Listen to auth events
      supabase.auth.onAuthStateChange.listen((data) {
        final event = data.event;
        final currentSession = data.session;

        if (event == AuthChangeEvent.signedOut) {
          state = AuthState(
            session: null,
            user: null,
            isGuest: true,
            isSessionExpired: false,
            isLoading: false,
          );
        } else if (event == AuthChangeEvent.tokenRefreshed || event == AuthChangeEvent.signedIn) {
          state = AuthState(
            session: currentSession,
            user: currentSession?.user,
            isGuest: currentSession == null,
            isSessionExpired: false,
            isLoading: false,
          );
        } else {
          state = state.copyWith(
            session: currentSession,
            user: currentSession?.user,
            isGuest: currentSession == null,
            isLoading: false,
          );
        }
      });
    } catch (e) {
      state = AuthState(isLoading: false, isGuest: true);
    }
  }

  bool isSessionValid() {
    final session = state.session;
    if (session == null) return false;
    final expiresAt = session.expiresAt;
    if (expiresAt == null) return true;

    final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    return expiresAt > (now + 60);
  }

  Future<void> signOut() async {
    await Supabase.instance.client.auth.signOut();
    state = AuthState(
      session: null,
      user: null,
      isGuest: true,
      isSessionExpired: false,
      isLoading: false,
    );
  }
}
