-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach to users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();


-- Function to create public user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        auth_id,
        email,
        full_name,
        role,
        signup_status,
        department,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        'pending',
        NEW.raw_user_meta_data->>'department',
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to prevent users from changing their own role unless admin
CREATE OR REPLACE FUNCTION public.prevent_self_role_change()
RETURNS TRIGGER AS $$
DECLARE
    changing_user_id UUID;
    is_admin BOOLEAN;
BEGIN
    changing_user_id := auth.uid();

    -- System triggers (no auth context) are allowed
    IF changing_user_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Check if the current user is an admin
    SELECT EXISTS (
        SELECT 1 FROM public.users
        WHERE auth_id = changing_user_id
        AND role = 'admin'
        AND signup_status = 'approved'
    ) INTO is_admin;

    -- If the user is changing their own role and is not an admin, block it
    IF OLD.auth_id = changing_user_id
       AND OLD.role IS DISTINCT FROM NEW.role
       AND NOT is_admin THEN
        RAISE EXCEPTION 'Only admins can change roles';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_prevent_self_role_change
    BEFORE UPDATE OF role ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_self_role_change();

-- ΓöÇΓöÇ Function 4: Sync email changes from auth to users ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ 
CREATE OR REPLACE FUNCTION public.sync_user_email() 
RETURNS TRIGGER AS $$ 
BEGIN 
    UPDATE public.users 
    SET email = NEW.email, updated_at = NOW() 
    WHERE auth_id = NEW.id; 
    RETURN NEW; 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER; 
  
CREATE TRIGGER on_auth_email_updated 
    AFTER UPDATE OF email ON auth.users 
    FOR EACH ROW 
    EXECUTE FUNCTION public.sync_user_email(); 
